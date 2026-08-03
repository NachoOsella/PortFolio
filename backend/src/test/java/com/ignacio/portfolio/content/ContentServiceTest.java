package com.ignacio.portfolio.content;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.ignacio.portfolio.config.ContentProperties;

class ContentServiceTest {

    @TempDir
    Path tempDirectory;

    @Test
    void writesContentLocallyAndTracksChangesUntilPush() {
        ContentProperties properties = new ContentProperties();
        properties.setRoot(tempDirectory.toString());
        ContentService service = new ContentService(properties, new MarkdownParser());

        service.create(
                ContentCollection.PROJECTS,
                "local-project.md",
                projectMarkdown("Local project"),
                null);

        assertTrue(tempDirectory.resolve("projects/local-project.md").toFile().isFile());
        assertEquals("added", service.localChanges().getFirst().status());

        service.markSynced(java.util.List.of("content/projects/local-project.md"));
        assertTrue(service.localChanges().isEmpty());
    }

    private String projectMarkdown(String title) {
        return """
                ---
                title: %s
                slug: local-project
                description: A local project.
                status: published
                updatedAt: 2026-08-03
                projectType: Product platform
                role: Full-stack developer
                duration: Ongoing
                technologies:
                  - React
                featured: false
                ---

                # Overview
                """.formatted(title);
    }
}
