package com.ignacio.portfolio.auth;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ignacio.portfolio.config.AppProperties;

@Service
public class SessionService {

    private final ConfiguredUsers configuredUsers;
    private final PasswordEncoder passwordEncoder;
    private final Duration sessionTtl;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, StoredSession> sessions = new ConcurrentHashMap<>();

    public SessionService(
            ConfiguredUsers configuredUsers,
            PasswordEncoder passwordEncoder,
            AppProperties properties) {
        this.configuredUsers = configuredUsers;
        this.passwordEncoder = passwordEncoder;
        this.sessionTtl = properties.getAuth().getSessionTtl();
    }

    public LoginResult authenticate(String email, String password, boolean remember) {
        AuthUser user = configuredUsers.find(email);
        if (user == null || password == null || !passwordEncoder.matches(password, user.passwordHash())) {
            return null;
        }

        String token = newToken();
        Instant expiresAt = Instant.now().plus(sessionTtl);
        UserSession session = user.session(remember);
        sessions.put(token, new StoredSession(user, session, expiresAt));
        return new LoginResult(token, session, expiresAt);
    }

    public UserSession findSession(String token) {
        StoredSession stored = findStoredSession(token);
        return stored == null ? null : stored.session();
    }

    public AuthUser findUser(String token) {
        StoredSession stored = findStoredSession(token);
        return stored == null ? null : stored.user();
    }

    public void revoke(String token) {
        if (token != null && !token.isBlank()) {
            sessions.remove(token);
        }
    }

    private StoredSession findStoredSession(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        StoredSession stored = sessions.get(token);
        if (stored == null) {
            return null;
        }
        if (stored.expiresAt().isBefore(Instant.now())) {
            sessions.remove(token, stored);
            return null;
        }
        return stored;
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private record StoredSession(AuthUser user, UserSession session, Instant expiresAt) {
    }

    public record LoginResult(String token, UserSession session, Instant expiresAt) {
    }
}
