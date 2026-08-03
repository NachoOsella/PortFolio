package com.ignacio.portfolio.content;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class MarkdownParserTest {

    private final MarkdownParser parser = new MarkdownParser();

    @Test
    void parsesProjectFrontmatterAndBody() {
        String raw = """
                ---
                title: Modular ERP
                slug: modular-erp
                description: A reusable foundation.
                status: published
                updatedAt: 2026-07-01
                projectType: Product platform
                role: Full-stack developer
                duration: Ongoing
                technologies:
                  - React
                  - Spring Boot
                featured: true
                ---

                # Overview
                """;

        MarkdownParser.ParsedMarkdown parsed = parser.parse(
                raw,
                ContentPath.parse("content/projects/modular-erp.md"));

        assertEquals("Modular ERP", parsed.frontmatter().get("title"));
        assertEquals("modular-erp", parsed.frontmatter().get("slug"));
        assertEquals("# Overview", parsed.body());
    }

    @Test
    void rejectsMissingRequiredPostMetadata() {
        String raw = """
                ---
                title: Notes
                slug: notes
                description: A note.
                status: published
                updatedAt: 2026-07-01
                category: Engineering
                ---
                Body
                """;

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> parser.parse(raw, ContentPath.parse("content/posts/notes.md")));

        assertEquals("tags must be a non-empty list of strings", error.getMessage());
    }

    @Test
    void rejectsUnsafePaths() {
        assertThrows(IllegalArgumentException.class, () -> ContentPath.parse("content/../secrets.md"));
        assertThrows(IllegalArgumentException.class, () -> ContentPath.parse("content/pages/about.txt"));
    }
}
