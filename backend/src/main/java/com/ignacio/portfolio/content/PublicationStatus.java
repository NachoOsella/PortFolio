package com.ignacio.portfolio.content;

public enum PublicationStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    SCHEDULED("scheduled"),
    ARCHIVED("archived");

    private final String value;

    PublicationStatus(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static PublicationStatus fromValue(Object value) {
        if (value == null) {
            throw new IllegalArgumentException("status is required");
        }
        for (PublicationStatus status : values()) {
            if (status.value.equalsIgnoreCase(String.valueOf(value))) {
                return status;
            }
        }
        throw new IllegalArgumentException("status must be draft, published, scheduled, or archived");
    }
}
