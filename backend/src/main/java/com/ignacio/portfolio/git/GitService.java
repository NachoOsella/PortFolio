package com.ignacio.portfolio.git;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ignacio.portfolio.github.GitHubClient;

@Service
public class GitService {

    private final GitHubClient githubClient;

    public GitService(GitHubClient githubClient) {
        this.githubClient = githubClient;
    }

    public GitStatus status() {
        List<GitHubClient.CommitSummary> commits = githubClient.listCommits();
        String lastSyncAt = commits.isEmpty()
                ? java.time.Instant.EPOCH.toString()
                : commits.getFirst().createdAt();
        return new GitStatus(
                githubClient.branch(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                0,
                0,
                lastSyncAt,
                false);
    }

    public List<GitCommit> history() {
        return githubClient.listCommits().stream()
                .map(commit -> new GitCommit(
                        commit.id(),
                        commit.message(),
                        commit.author(),
                        commit.createdAt(),
                        commit.files()))
                .toList();
    }

    public GitPushResult push() {
        return new GitPushResult(true, 0, "GitHub is the remote source of truth; there is nothing pending to push.");
    }

    public GitPullResult pull() {
        return new GitPullResult(true, List.of(), "Content is read directly from the configured GitHub branch.", false);
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
