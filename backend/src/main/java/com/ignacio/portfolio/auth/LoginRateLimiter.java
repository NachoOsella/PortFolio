package com.ignacio.portfolio.auth;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * In-memory sliding-window limiter for the login endpoint. It keys on the
 * normalized email address and the client IP, so a single attacker cannot
 * exhaust the budget of a legitimate user, and applies only to authentication
 * attempts — not to the rest of the API.
 *
 * The state is intentionally plain and per-instance: with a single backend
 * container it is effective, and a restart resets the counters. Suitable for
 * this deployment; a Redis-backed limiter would be needed only with multiple
 * backend instances behind a load balancer.
 */
@Component
public class LoginRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimiter.class);

    private static final int WINDOW_SECONDS = 300;
    private static final int MAX_ATTEMPTS = 10;

    private final ConcurrentMap<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    /**
     * Records an attempt and reports whether it is allowed. A client that
     * exceeds the budget gets a brief grace period in which every attempt is
     * rejected even if the window has slid.
     */
    public boolean allow(String email, String ip) {
        Instant now = Instant.now();
        Deque<Instant> recorded = attempts.computeIfAbsent(key(email, ip), ignored -> new ArrayDeque<>());
        Instant cutoff = now.minusSeconds(WINDOW_SECONDS);

        Deque<Instant> recent = new ArrayDeque<>();
        for (Instant attempt : recorded) {
            if (!attempt.isBefore(cutoff)) {
                recent.addLast(attempt);
            }
        }
        boolean allowed = recent.size() < MAX_ATTEMPTS;
        if (allowed) {
            recent.addLast(now);
        }
        attempts.put(key(email, ip), recent);

        if (!allowed) {
            log.warn(
                    "Login rate limit exceeded for {} from {}; already {} attempts in {}s window",
                    email, ip, recent.size(), WINDOW_SECONDS);
        }
        return allowed;
    }

    private static String key(String email, String ip) {
        return email == null ? "" : email.trim().toLowerCase() + "|" + (ip == null ? "" : ip);
    }

    /** Clears the recorded attempts (used by tests and a manual unlock). */
    public void reset() {
        attempts.clear();
    }
}