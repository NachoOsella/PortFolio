package com.ignacio.portfolio.git;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ignacio.portfolio.content.ContentPath;
import com.ignacio.portfolio.content.ContentService;
import com.ignacio.portfolio.github.GitHubClient;

@ExtendWith(MockitoExtension.class)
class GitServiceTest {

    @Mock
    GitHubClient githubClient;

    @Mock
    ContentService contentService;

    @Test
    void pushWithoutLocalChangesIsANoOp() {
        when(contentService.localChanges()).thenReturn(List.of());
        GitService git = new GitService(githubClient, contentService);

        GitService.GitPushResult result = git.push();

        assertTrue(result.success());
        assertEquals(0, result.pushedCommits());
        verify(githubClient, never()).requireWriteAccess();
    }

    @Test
    void pushWritesAndDeletesRemoteFilesAndMarksThemSynced() {
        ContentPath about = ContentPath.parse("content/pages/about.md");
        ContentPath retired = ContentPath.parse("content/projects/retired.md");
        when(contentService.localChanges()).thenReturn(List.of(
                new ContentService.LocalChange(about.value(), "modified"),
                new ContentService.LocalChange(retired.value(), "deleted")));
        when(contentService.readRawForSync(about.value())).thenReturn("# About");
        when(githubClient.getFile(about))
                .thenReturn(Optional.of(new GitHubClient.RemoteFile("sha-old", 0, "")));
        when(githubClient.getFile(retired))
                .thenReturn(Optional.of(new GitHubClient.RemoteFile("sha-remote", 0, "")));

        GitService git = new GitService(githubClient, contentService);
        GitService.GitPushResult result = git.push();

        assertTrue(result.success());
        assertEquals(2, result.pushedCommits());
        verify(githubClient).requireWriteAccess();
        verify(githubClient).putFile(about, "# About", "content: sync about", "sha-old");
        verify(githubClient).deleteFile(retired, "sha-remote", "content: sync retired");
        verify(contentService).markSynced(List.of(about.value(), retired.value()));
    }

    @Test
    void pushWithNoRemoteFileCreatesItWithoutAHash() {
        ContentPath post = ContentPath.parse("content/posts/new-post.md");
        when(contentService.localChanges()).thenReturn(List.of(
                new ContentService.LocalChange(post.value(), "added")));
        when(contentService.readRawForSync(post.value())).thenReturn("# New");
        when(githubClient.getFile(post)).thenReturn(Optional.empty());
        when(githubClient.branch()).thenReturn("main");

        GitService git = new GitService(githubClient, contentService);
        GitService.GitPushResult result = git.push();

        assertTrue(result.success());
        verify(githubClient).putFile(post, "# New", "content: sync new-post", null);
        // After a push the working tree is synced, so status reports nothing ahead.
        when(contentService.localChanges()).thenReturn(List.of());
        GitService.GitStatus status = git.status();
        assertEquals(0, status.ahead());
        assertEquals("main", status.branch());
    }
}