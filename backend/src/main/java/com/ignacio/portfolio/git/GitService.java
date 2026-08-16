package com.ignacio.portfolio.git;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ignacio.portfolio.content.ContentPath;
import com.ignacio.portfolio.content.ContentService;
import com.ignacio.portfolio.github.GitHubClient;

@Service
public class GitService {

    private static final Logger log = LoggerFactory.getLogger(GitService.class);


    private final GitHubClient githubClient;
    private final ContentService contentService;
    private final List<GitCommit> localHistory = new ArrayList<>();
    private volatile Instant lastSyncAt;

    public GitService(GitHubClient githubClient, ContentService contentService) {
        this.githubClient = githubClient;
        this.contentService = contentService;
    }

    public GitStatus status() {
        List<ContentService.LocalChange> changes = contentService.localChanges();
        return new GitStatus(
                githubClient.branch(),
                changes.stream().filter(change -> "modified".equals(change.status())).map(ContentService.LocalChange::path).toList(),
                changes.stream().filter(change -> "added".equals(change.status())).map(ContentService.LocalChange::path).toList(),
                changes.stream().filter(change -> "deleted".equals(change.status())).map(ContentService.LocalChange::path).toList(),
                List.of(),
                changes.size(),
                0,
                lastSyncAt == null ? "" : lastSyncAt.toString(),
                false);
    }

    public synchronized List<GitCommit> history() {
        return List.copyOf(localHistory);
    }

    public synchronized GitPushResult push() {
        List<ContentService.LocalChange> changes = contentService.localChanges();
        if (changes.isEmpty()) {
            return new GitPushResult(true, 0, "Local content is already synchronized.");
        }
        log.info("Pushing {} content change(s) to GitHub: {}", changes.size(),
                changes.stream().map(ContentService.LocalChange::path).toList());

        githubClient.requireWriteAccess();
        List<String> synchronizedPaths = new ArrayList<>();
        List<String> pushedPaths = new ArrayList<>();
        for (ContentService.LocalChange change : changes) {
            ContentPath path = ContentPath.parse(change.path());
            String message = "content: sync " + path.filename().replaceFirst("\\.md$", "");
            if ("deleted".equals(change.status())) {
                githubClient.getFile(path).ifPresent(remote -> {
                    githubClient.deleteFile(path, remote.sha(), message);
                });
            } else {
                String raw = contentService.readRawForSync(path.value());
                String sha = githubClient.getFile(path).map(GitHubClient.RemoteFile::sha).orElse(null);
                githubClient.putFile(path, raw, message, sha);
            }
            synchronizedPaths.add(change.path());
            pushedPaths.add(change.path());
            contentService.markSynced(List.of(change.path()));
        }

        contentService.markSynced(synchronizedPaths);
        Instant syncedAt = Instant.now();
        lastSyncAt = syncedAt;
        localHistory.add(0, new GitCommit(
                UUID.randomUUID().toString().substring(0, 7),
                "content: synchronize local Markdown",
                "Ignacio Osella",
                syncedAt.toString(),
                List.copyOf(pushedPaths)));
        return new GitPushResult(
                true,
                pushedPaths.size(),
                pushedPaths.size() == 1
                        ? "1 local Markdown file pushed to GitHub."
                        : pushedPaths.size() + " local Markdown files pushed to GitHub.");
    }

    public GitPullResult pull() {
        return new GitPullResult(
                true,
                List.of(),
                "Local content is the source of truth. GitHub is only used when you push changes.",
                false);
    }

    public record GitStatus(
            String branch,
            List<String> modified,
            List<String> added,
            List<String> deleted,
            List<String> untracked,
            int ahead,
            int behind,
            String lastSyncAt,
            boolean conflict) {
    }

    public record GitCommit(
            String id,
            String message,
            String author,
            String createdAt,
            List<String> files) {
    }

    public record GitPushResult(boolean success, int pushedCommits, String message) {
    }

    public record GitPullResult(boolean success, List<String> updatedFiles, String message, boolean conflict) {
    }
}
