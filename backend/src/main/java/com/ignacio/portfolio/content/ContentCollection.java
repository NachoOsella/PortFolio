package com.ignacio.portfolio.content;

public enum ContentCollection {
    PROJECTS("projects"),
    POSTS("posts"),
    PAGES("pages");

    private final String value;

    ContentCollection(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static ContentCollection fromValue(String value) {
        for (ContentCollection collection : values()) {
            if (collection.value.equalsIgnoreCase(value)) {
                return collection;
            }
        }
        throw new IllegalArgumentException("Collection must be projects, posts, or pages");
    }
}
