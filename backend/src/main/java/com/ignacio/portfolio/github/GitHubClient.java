package com.ignacio.portfolio.github;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ignacio.portfolio.config.GitHubProperties;
import com.ignacio.portfolio.content.ContentPath;

import org.springframework.stereotype.Component;

@Component
public class GitHubClient {

    private static final String MEDIA_TYPE = "application/vnd.github+json";
    private static final String API_VERSION = "2022-11-28";

    private final GitHubProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String repositoryUrl;

    public GitHubClient(GitHubProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.getTimeout())
                .build();
        this.repositoryUrl = trimTrailingSlash(properties.getApiUrl())
                + "/repos/" + encodeSegment(properties.getOwner())
                + "/" + encodeSegment(properties.getRepository());
    }

    public Optional<RemoteFile> getFile(ContentPath path) {
        JsonNode response = request(
                "GET",
                "/contents/" + encodePath(toRemotePath(path)) + "?ref=" + encodeSegment(properties.getBranch()),
                null,
                200,
                404);
        if (response == null || response.isArray()) {
            return Optional.empty();
        }
        return Optional.of(parseRemoteFile(response));
    }

    public List<String> listMarkdownPaths() {
        JsonNode response = request(
                "GET",
                "/git/trees/" + encodeSegment(properties.getBranch()) + "?recursive=1",
                null,
                200);
        List<String> paths = new ArrayList<>();
        String root = normalizedRoot();
        JsonNode tree = response.path("tree");
        if (!tree.isArray()) {
            throw new GitHubApiException(502, "GitHub returned an invalid repository tree");
        }
        for (JsonNode entry : tree) {
            String remotePath = entry.path("path").asText("");
            if ("blob".equals(entry.path("type").asText())
                    && remotePath.startsWith(root + "/")
                    && remotePath.endsWith(".md")) {
                paths.add("content/" + remotePath.substring(root.length() + 1));
            }
        }
        return paths;
    }

    public RemoteFile putFile(ContentPath path, String raw, String message, String sha) {
        requireWriteConfiguration();
        String encodedContent = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        var payload = new java.util.LinkedHashMap<String, Object>();
        payload.put("message", message);
        payload.put("content", encodedContent);
        payload.put("branch", properties.getBranch());
        if (sha != null && !sha.isBlank()) {
            payload.put("sha", sha);
        }
        JsonNode response = request(
                "PUT",
                "/contents/" + encodePath(toRemotePath(path)),
                writeJson(payload),
                200, 201);
        return parseRemoteFile(response.path("content"));
    }

    public void deleteFile(ContentPath path, String sha, String message) {
        requireWriteConfiguration();
        var payload = new java.util.LinkedHashMap<String, Object>();
        payload.put("message", message);
        payload.put("sha", sha);
        payload.put("branch", properties.getBranch());
        request(
                "DELETE",
                "/contents/" + encodePath(toRemotePath(path)),
                writeJson(payload),
                200);
    }

    public List<CommitSummary> listCommits() {
        JsonNode response = request(
                "GET",
                "/commits?sha=" + encodeSegment(properties.getBranch())
                        + "&path=" + encodeQuery(normalizedRoot()) + "&per_page=20",
                null,
                200);
        List<CommitSummary> commits = new ArrayList<>();
        if (!response.isArray()) {
            return commits;
        }
        for (JsonNode item : response) {
            JsonNode commit = item.path("commit");
            String author = commit.path("author").path("name").asText(
                    item.path("author").path("login").asText("GitHub"));
            String date = commit.path("author").path("date").asText(Instant.EPOCH.toString());
            commits.add(new CommitSummary(
                    shortSha(item.path("sha").asText()),
                    commit.path("message").asText(""),
                    author,
                    date,
                    List.of()));
        }
        return commits;
    }

    public String branch() {
        return properties.getBranch();
    }

    public String latestCommitAt() {
        return listCommits().stream()
                .findFirst()
                .map(CommitSummary::createdAt)
                .orElse(Instant.EPOCH.toString());
    }

    private JsonNode request(String method, String path, String body, int... expectedStatuses) {
        requireConfiguration();
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(repositoryUrl + path))
                    .timeout(properties.getTimeout())
                    .header("Accept", MEDIA_TYPE)
                    .header("X-GitHub-Api-Version", API_VERSION)
                    .header("User-Agent", "portfolio-backend");
            if (!properties.getToken().isBlank()) {
                builder.header("Authorization", "Bearer " + properties.getToken());
            }
            if (body == null) {
                builder.method(method, HttpRequest.BodyPublishers.noBody());
            } else {
                builder.header("Content-Type", "application/json")
                        .method(method, HttpRequest.BodyPublishers.ofString(body));
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (!contains(expectedStatuses, response.statusCode())) {
                throw new GitHubApiException(response.statusCode(), githubMessage(response));
            }
            if (response.statusCode() == 404) {
                return null;
            }
            if (response.body() == null || response.body().isBlank()) {
                return objectMapper.createObjectNode();
            }
            return objectMapper.readTree(response.body());
        } catch (GitHubApiException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GitHubApiException(502, "The GitHub request was interrupted");
        } catch (Exception exception) {
            throw new GitHubApiException(502, "GitHub is unavailable: " + exception.getMessage());
        }
    }

    private String githubMessage(HttpResponse<String> response) {
        try {
            String message = objectMapper.readTree(response.body()).path("message").asText("");
            return message.isBlank() ? "GitHub request failed with HTTP " + response.statusCode() : message;
        } catch (Exception ignored) {
            return "GitHub request failed with HTTP " + response.statusCode();
        }
    }

    private RemoteFile parseRemoteFile(JsonNode node) {
        if (node == null || node.isMissingNode() || node.path("sha").asText("").isBlank()) {
            throw new GitHubApiException(502, "GitHub returned an invalid content response");
        }
        String encoded = node.path("content").asText("").replaceAll("\\s", "");
        String content = encoded.isBlank()
                ? null
                : new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
        return new RemoteFile(node.path("sha").asText(), node.path("size").asInt(0), content);
    }

    private void requireConfiguration() {
        if (properties.getOwner().isBlank() || properties.getRepository().isBlank()) {
            throw new GitHubApiException(503, "GITHUB_OWNER and GITHUB_REPOSITORY are required");
        }
    }

    private void requireWriteConfiguration() {
        requireConfiguration();
        if (properties.getToken().isBlank()) {
            throw new GitHubApiException(503, "GITHUB_TOKEN is required for write operations");
        }
    }

    private String toRemotePath(ContentPath path) {
        return normalizedRoot() + "/" + path.value().substring("content/".length());
    }

    private String normalizedRoot() {
        String root = properties.getContentRoot().trim().replace('\\', '/');
        while (root.startsWith("/")) {
            root = root.substring(1);
        }
        while (root.endsWith("/")) {
            root = root.substring(0, root.length() - 1);
        }
        if (root.isBlank() || root.contains("..")) {
            throw new GitHubApiException(503, "GITHUB_CONTENT_ROOT is invalid");
        }
        return root;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new GitHubApiException(502, "Could not encode the GitHub request");
        }
    }

    private static boolean contains(int[] values, int candidate) {
        for (int value : values) {
            if (value == candidate) {
                return true;
            }
        }
        return false;
    }

    private static String trimTrailingSlash(String value) {
        String result = value == null ? "" : value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    private static String encodePath(String value) {
        return java.util.Arrays.stream(value.split("/"))
                .map(GitHubClient::encodeSegment)
                .reduce((left, right) -> left + "/" + right)
                .orElse("");
    }

    private static String encodeSegment(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("%2F", "%2F");
    }

    private static String encodeQuery(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String shortSha(String sha) {
        return sha.length() > 7 ? sha.substring(0, 7) : sha;
    }

    public record RemoteFile(String sha, int size, String content) {
    }

    public record CommitSummary(String id, String message, String author, String createdAt, List<String> files) {
    }
}
