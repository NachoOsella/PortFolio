package com.ignacio.portfolio.github;

public class GitHubApiException extends RuntimeException {

    private final int status;

    public GitHubApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int status() {
        return status;
    }
}
