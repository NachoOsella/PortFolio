package com.ignacio.portfolio.content;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import org.springframework.stereotype.Component;

@Component
public class MarkdownParser {

    private static final Pattern FRONTMATTER = Pattern.compile("^---\\r?\\n([\\s\\S]*?)\\r?\\n---(?:\\r?\\n|$)");
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    public ParsedMarkdown parse(String raw, ContentPath path) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Markdown content cannot be empty");
        }
        if (raw.length() > 512_000) {
            throw new IllegalArgumentException("Markdown content exceeds the 512 KB limit");
        }

        var matcher = FRONTMATTER.matcher(raw);
        if (!matcher.find()) {
            throw new IllegalArgumentException("Markdown must start with YAML frontmatter");
        }

        Map<String, Object> frontmatter;
        try {
            frontmatter = yamlMapper.readValue(
                    matcher.group(1), new TypeReference<LinkedHashMap<String, Object>>() {
                    });
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid YAML frontmatter: " + exception.getMessage(), exception);
        }
        if (frontmatter == null) {
            throw new IllegalArgumentException("YAML frontmatter must be an object");
        }

        validate(frontmatter, path.collection());
        return new ParsedMarkdown(frontmatter, raw.substring(matcher.end()).trim());
    }

    private void validate(Map<String, Object> frontmatter, ContentCollection collection) {
        requireText(frontmatter, "title");
        String slug = requireText(frontmatter, "slug");
        if (!SLUG.matcher(slug).matches()) {
            throw new IllegalArgumentException("slug must use lowercase words separated by hyphens");
        }
        requireText(frontmatter, "description");
        PublicationStatus.fromValue(frontmatter.get("status"));
        requireText(frontmatter, "updatedAt");

        switch (collection) {
            case PROJECTS -> {
                requireText(frontmatter, "projectType");
                requireText(frontmatter, "role");
                requireText(frontmatter, "duration");
                requireStringList(frontmatter, "technologies");
                if (!(frontmatter.get("featured") instanceof Boolean)) {
                    throw new IllegalArgumentException("featured must be a boolean");
                }
            }
            case POSTS -> {
                requireText(frontmatter, "category");
                requireStringList(frontmatter, "tags");
                requireText(frontmatter, "publishedAt");
            }
            case PAGES -> {
                // Pages only require the base frontmatter fields.
            }
        }
    }

    private String requireText(Map<String, Object> frontmatter, String field) {
        Object value = frontmatter.get(field);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return String.valueOf(value);
    }

    private void requireStringList(Map<String, Object> frontmatter, String field) {
        Object value = frontmatter.get(field);
        if (!(value instanceof Collection<?> values) || values.isEmpty()
                || values.stream().anyMatch(item -> item == null || String.valueOf(item).isBlank())) {
            throw new IllegalArgumentException(field + " must be a non-empty list of strings");
        }
    }

    public record ParsedMarkdown(Map<String, Object> frontmatter, String body) {
    }
}
