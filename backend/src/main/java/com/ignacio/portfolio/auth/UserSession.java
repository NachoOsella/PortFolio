package com.ignacio.portfolio.auth;

import java.time.Instant;

public record UserSession(String email, String name, boolean remember, Instant createdAt) {
}
