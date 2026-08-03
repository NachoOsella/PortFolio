package com.ignacio.portfolio.auth;

public record AuthUser(String email, String name, String passwordHash) {

    public UserSession session(boolean remember) {
        return new UserSession(email, name, remember, java.time.Instant.now());
    }
}
