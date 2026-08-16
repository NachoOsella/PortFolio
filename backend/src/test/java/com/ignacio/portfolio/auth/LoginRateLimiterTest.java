package com.ignacio.portfolio.auth;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class LoginRateLimiterTest {

    @Test
    void allowsAttemptsUpToTheWindowBudget() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int attempt = 0; attempt < 10; attempt++) {
            assertTrue(limiter.allow("author@example.com", "127.0.0.1"), "attempt " + attempt);
        }
        assertFalse(limiter.allow("author@example.com", "127.0.0.1"));
    }

    @Test
    void separatesBudgetsPerEmailAndPerIp() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int attempt = 0; attempt < 11; attempt++) {
            limiter.allow("author@example.com", "127.0.0.1");
        }
        // A different credential or a different IP must not inherit the blocked budget.
        assertTrue(limiter.allow("other@example.com", "127.0.0.1"));
        assertTrue(limiter.allow("author@example.com", "10.0.0.2"));
    }

    @Test
    void emailKeysAreCaseInsensitiveAndTrimmed() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        limiter.allow(" Author@Example.com ", "127.0.0.1");
        assertTrue(limiter.allow("author@example.com", "127.0.0.1"));
    }

    @Test
    void resetClearsBlockedState() {
        LoginRateLimiter limiter = new LoginRateLimiter();
        for (int attempt = 0; attempt < 11; attempt++) {
            limiter.allow("author@example.com", "127.0.0.1");
        }
        assertFalse(limiter.allow("author@example.com", "127.0.0.1"));
        limiter.reset();
        assertTrue(limiter.allow("author@example.com", "127.0.0.1"));
    }
}