package com.ignacio.portfolio.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ignacio.portfolio.config.AppProperties;

class SessionServiceTest {

    private SessionService sessionService;

    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties();
        properties.getAuth().setUsers("author@example.com|" + ENCODER.encode("correct-password") + "|Author Name");
        properties.getAuth().setSessionTtl(Duration.ofHours(1));
        sessionService = new SessionService(new ConfiguredUsers(properties), ENCODER, properties);
    }

    @Test
    void authenticatesWithValidCredentialsAndIssuesAnOpaqueToken() {
        SessionService.LoginResult result = sessionService.authenticate("author@example.com", "correct-password", false);
        assertNotNull(result);
        // 32 random bytes base64url-encoded, never the plaintext password.
        assertEquals(43, result.token().length());
        assertEquals("Author Name", result.session().name());
        assertTrue(result.expiresAt().isAfter(java.time.Instant.now()));
    }

    @Test
    void rejectsWrongPasswordAndUnknownEmail() {
        assertNull(sessionService.authenticate("author@example.com", "wrong-password", false));
        assertNull(sessionService.authenticate("nobody@example.com", "correct-password", false));
        assertNull(sessionService.authenticate("author@example.com", null, false));
    }

    @Test
    void findsActiveSessionsAndDropsExpiredOrRevokedOnes() {
        String token = sessionService.authenticate("author@example.com", "correct-password", false).token();
        assertNotNull(sessionService.findSession(token));

        sessionService.revoke(token);
        assertNull(sessionService.findSession(token));
        assertNull(sessionService.findSession(null));
        assertNull(sessionService.findSession(""));

        // An expired session is treated as absent and removed from the store.
        AppProperties shortTtl = new AppProperties();
        shortTtl.getAuth().setUsers("author@example.com|" + ENCODER.encode("correct-password") + "|Author Name");
        shortTtl.getAuth().setSessionTtl(Duration.ofMillis(1));
        SessionService shortLived = new SessionService(new ConfiguredUsers(shortTtl), ENCODER, shortTtl);
        String shortToken = shortLived.authenticate("author@example.com", "correct-password", false).token();
        try {
            Thread.sleep(5);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
        assertNull(shortLived.findSession(shortToken));
    }
}