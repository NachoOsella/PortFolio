package com.ignacio.portfolio.content;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ignacio.portfolio.error.ConflictException;
import com.ignacio.portfolio.error.NotFoundException;
import com.ignacio.portfolio.github.GitHubClient;

@Service
public class ContentService {

    private static final Pattern UPDATED_AT = Pattern.compile("(?m)^updatedAt\\s*:\\s*[^\\r\\n]*$");

    private final GitHubClient githubClient;
    private final MarkdownParser markdownParser;
    private final ReentrantLock mutationLock = new ReentrantLock();

    public ContentService(GitHubClient githubClient, MarkdownParser markdownParser) {
        this.githubClient = githubClient;
        this.markdownParser = markdownParser;
    }

    public List<ContentFileSummary> listFiles(
            ContentCollection collection,
            String search,
            PublicationStatus status,
            Boolean featured,
            boolean authenticated) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();
        return githubClient.listMarkdownPaths().stream()
                .map(ContentPath::parse)
                .filter(path -> collection == null || path.collection() == collection)
                .map(this::read)
                .filter(document -> authenticated || isPubliclyVisible(document.frontmatter(), Instant.now()))
                .filter(document -> status == null || status == statusOf(document.frontmatter()))
                .filter(document -> featured == null || featured.equals(document.frontmatter().get("featured")))
                .filter(document -> normalizedSearch.isBlank()
                        || (document.frontmatter().get("title") + " "
                                + document.frontmatter().get("slug") + " "
                                + document.filename()).toLowerCase().contains(normalizedSearch))
                .map(this::summary)
                .toList();
    }

    public MarkdownDocument getFile(String rawPath, boolean authenticated) {
        ContentPath path = ContentPath.parse(rawPath);
        MarkdownDocument document = read(path);
        if (!authenticated && !isPubliclyVisible(document.frontmatter(), Instant.now())) {
            throw new NotFoundException("Markdown file not found");
        }
        return document;
    }

    public MarkdownDocument create(
            ContentCollection collection,
            String filename,
            String raw,
            String commitMessage) {
        ContentPath path = ContentPath.fromCollectionAndFilename(collection, filename);
        mutationLock.lock();
        try {
            if (githubClient.getFile(path).isPresent()) {
                throw new ConflictException("A file with this path already exists");
            }
            String stampedRaw = stampUpdatedAt(raw);
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(stampedRaw, path);
            githubClient.putFile(path, stampedRaw, message(commitMessage, "create", parsed.frontmatter()), null);
            return document(path, parsed, stampedRaw, Instant.now(), 1);
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument update(String rawPath, String raw, String commitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        mutationLock.lock();
        try {
            GitHubClient.RemoteFile current = githubClient.getFile(path)
                    .orElseThrow(() -> new NotFoundException("Markdown file not found"));
            String stampedRaw = stampUpdatedAt(raw);
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(stampedRaw, path);
            githubClient.putFile(path, stampedRaw, message(commitMessage, "update", parsed.frontmatter()), current.sha());
            Instant createdAt = updatedAt(current.content(), path);
            return document(path, parsed, stampedRaw, createdAt, 2);
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument rename(String rawPath, String rawNewPath, String commitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        ContentPath newPath = ContentPath.parse(rawNewPath);
        if (path.collection() != newPath.collection()) {
            throw new IllegalArgumentException("A file can only be renamed within its collection");
        }
        mutationLock.lock();
        try {
            GitHubClient.RemoteFile current = githubClient.getFile(path)
                    .orElseThrow(() -> new NotFoundException("Markdown file not found"));
            if (githubClient.getFile(newPath).isPresent()) {
                throw new ConflictException("A file with the destination path already exists");
            }
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(current.content(), path);
            String message = message(commitMessage, "rename", parsed.frontmatter());
            githubClient.putFile(newPath, current.content(), message, null);
            githubClient.deleteFile(path, current.sha(), message);
            return document(newPath, parsed, current.content(), updatedAt(current.content(), path), 2);
        } finally {
            mutationLock.unlock();
        }
    }

    public void delete(String rawPath, String commitMessage) {
        ContentPath path = ContentPath.parse(rawPath);
        mutationLock.lock();
        try {
            GitHubClient.RemoteFile current = githubClient.getFile(path)
                    .orElseThrow(() -> new NotFoundException("Markdown file not found"));
            githubClient.deleteFile(path, current.sha(), message(commitMessage, "delete", Map.of("title", path.filename())));
        } finally {
            mutationLock.unlock();
        }
    }

    public MarkdownDocument importFile(
            ContentCollection collection,
            String filename,
            String raw,
            boolean overwrite,
            String commitMessage) {
        ContentPath path = ContentPath.fromCollectionAndFilename(collection, filename);
        mutationLock.lock();
        try {
            Optional<GitHubClient.RemoteFile> current = githubClient.getFile(path);
            if (current.isPresent() && !overwrite) {
                throw new ConflictException("A file with this path already exists");
            }
            String stampedRaw = stampUpdatedAt(raw);
            MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(stampedRaw, path);
            githubClient.putFile(
                    path,
                    stampedRaw,
                    message(commitMessage, overwrite ? "import" : "add", parsed.frontmatter()),
                    current.map(GitHubClient.RemoteFile::sha).orElse(null));
            Instant createdAt = current.map(file -> updatedAt(file.content(), path)).orElse(Instant.now());
            return document(path, parsed, stampedRaw, createdAt, current.isPresent() ? 2 : 1);
        } finally {
            mutationLock.unlock();
        }
    }

    private MarkdownDocument read(ContentPath path) {
        GitHubClient.RemoteFile remote = githubClient.getFile(path)
                .orElseThrow(() -> new NotFoundException("Markdown file not found"));
        if (remote.content() == null) {
            throw new IllegalStateException("GitHub did not return the Markdown file contents");
        }
        MarkdownParser.ParsedMarkdown parsed = markdownParser.parse(remote.content(), path);
        return document(path, parsed, remote.content(), updatedAt(remote.content(), path), 1);
    }

    private MarkdownDocument document(
            ContentPath path,
            MarkdownParser.ParsedMarkdown parsed,
            String raw,
            Instant createdAt,
            int version) {
        Instant now = Instant.now();
        return new MarkdownDocument(
                path.value(),
                path.filename(),
                path.collection().value(),
                parsed.frontmatter(),
                parsed.body(),
                raw,
                version,
                raw.getBytes(StandardCharsets.UTF_8).length,
                createdAt.toString(),
                now.toString(),
                "synced");
    }

    private ContentFileSummary summary(MarkdownDocument document) {
        Map<String, Object> frontmatter = document.frontmatter();
        List<String> technologies = stringList(frontmatter.get("technologies"));
        return new ContentFileSummary(
                document.path(),
                document.filename(),
                document.collection(),
                String.valueOf(frontmatter.get("title")),
                String.valueOf(frontmatter.get("slug")),
                statusOf(frontmatter).value(),
                frontmatter.get("featured") instanceof Boolean value ? value : null,
                frontmatter.get("category") == null ? null : String.valueOf(frontmatter.get("category")),
                technologies.isEmpty() ? null : technologies,
                document.updatedAt(),
                document.size(),
                document.synchronizationStatus(),
                null);
    }

    private PublicationStatus statusOf(Map<String, Object> frontmatter) {
        return PublicationStatus.fromValue(frontmatter.get("status"));
    }

    private boolean isPubliclyVisible(Map<String, Object> frontmatter, Instant now) {
        PublicationStatus status = statusOf(frontmatter);
        if (status == PublicationStatus.PUBLISHED) {
            return true;
        }
        if (status != PublicationStatus.SCHEDULED) {
            return false;
        }
        Object publishedAt = frontmatter.get("publishedAt");
        if (publishedAt == null) {
            return false;
        }
        return parseInstant(publishedAt).map(date -> !date.isAfter(now)).orElse(false);
    }

    private Optional<Instant> parseInstant(Object value) {
        String text = String.valueOf(value);
        try {
            if (text.length() == 10) {
                return Optional.of(LocalDate.parse(text).atStartOfDay(ZoneOffset.UTC).toInstant());
            }
            return Optional.of(Instant.parse(text));
        } catch (DateTimeParseException exception) {
            return Optional.empty();
        }
    }

    private Instant updatedAt(String raw, ContentPath path) {
        try {
            return parseInstant(markdownParser.parse(raw, path).frontmatter().get("updatedAt"))
                    .orElse(Instant.now());
        } catch (RuntimeException exception) {
            return Instant.now();
        }
    }

    private String stampUpdatedAt(String raw) {
        int closingDelimiter = raw.indexOf("\n---", 4);
        if (closingDelimiter < 0) {
            return raw;
        }
        String frontmatter = raw.substring(0, closingDelimiter);
        String updatedFrontmatter = UPDATED_AT.matcher(frontmatter)
                .replaceFirst("updatedAt: " + LocalDate.now(ZoneOffset.UTC));
        return updatedFrontmatter + raw.substring(closingDelimiter);
    }

    private String message(String requested, String action, Map<String, Object> frontmatter) {
        String value = requested == null ? "" : requested.trim();
        if (value.isBlank()) {
            value = "content: " + action + " " + String.valueOf(frontmatter.getOrDefault("title", "markdown"));
        }
        return value.length() > 200 ? value.substring(0, 200) : value;
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof Collection<?> values)) {
            return List.of();
        }
        return values.stream().map(String::valueOf).collect(Collectors.toCollection(ArrayList::new));
    }

    public record MarkdownDocument(
            String path,
            String filename,
            String collection,
            Map<String, Object> frontmatter,
            String body,
            String raw,
            int version,
            int size,
            String createdAt,
            String updatedAt,
            String synchronizationStatus) {
    }

    public record ContentFileSummary(
            String path,
            String filename,
            String collection,
            String title,
            String slug,
            String status,
            Boolean featured,
            String category,
            List<String> technologies,
            String updatedAt,
            int size,
            String synchronizationStatus,
            String gitStatus) {
    }
}
