package com.ignacio.portfolio.content;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record ContentPath(String value, ContentCollection collection, String filename) {

    private static final Pattern PATH = Pattern.compile("^content/(projects|posts|pages)/([^/]+\\.md)$");

    public static ContentPath parse(String rawPath) {
        if (rawPath == null) {
            throw new IllegalArgumentException("Content path is required");
        }
        String path = rawPath.trim().replace('\\', '/');
        while (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.contains("..") || path.contains("//")) {
            throw new IllegalArgumentException("Invalid content path");
        }
        Matcher matcher = PATH.matcher(path);
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                    "Content path must look like content/projects/example.md");
        }
        return new ContentPath(path, ContentCollection.fromValue(matcher.group(1)), matcher.group(2));
    }

    public static ContentPath fromCollectionAndFilename(ContentCollection collection, String rawFilename) {
        if (collection == null || rawFilename == null || rawFilename.isBlank()) {
            throw new IllegalArgumentException("Collection and filename are required");
        }
        String filename = rawFilename.trim().replace('\\', '/');
        if (filename.startsWith("content/")) {
            ContentPath path = parse(filename);
            if (path.collection() != collection) {
                throw new IllegalArgumentException("Filename collection does not match the requested collection");
            }
            return path;
        }
        return parse("content/" + collection.value() + "/" + filename);
    }
}
