package com.ignacio.portfolio.auth;

import java.time.Duration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ignacio.portfolio.config.AppProperties;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SessionService sessionService;
    private final LoginRateLimiter loginRateLimiter;
    private final AppProperties properties;

    public AuthController(
            SessionService sessionService,
            LoginRateLimiter loginRateLimiter,
            AppProperties properties) {
        this.sessionService = sessionService;
        this.loginRateLimiter = loginRateLimiter;
        this.properties = properties;
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getToken());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        if (!loginRateLimiter.allow(request.email(), clientIp(httpRequest))) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AuthError("Too many sign-in attempts. Try again in a few minutes."));
        }

        SessionService.LoginResult result = sessionService.authenticate(
                request.email(), request.password(), request.remember());
        if (result == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthError("Invalid email or password."));
        }

        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(result.token(), request.remember(), result.expiresAt()));
        return ResponseEntity.ok(result.session());
    }

    @GetMapping("/session")
    public ResponseEntity<UserSession> session(HttpServletRequest request) {
        String token = cookieValue(request);
        UserSession session = sessionService.findSession(token);
        return session == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(session);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionService.revoke(cookieValue(request));
        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie());
        return ResponseEntity.noContent().build();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Caddy runs in front of the backend; take the leftmost entry.
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String cookieValue(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (var cookie : request.getCookies()) {
            if (properties.getAuth().getCookieName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String sessionCookie(String token, boolean remember, java.time.Instant expiresAt) {
        ResponseCookie.ResponseCookieBuilder cookie = ResponseCookie.from(properties.getAuth().getCookieName(), token)
                .httpOnly(true)
                .secure(properties.getAuth().isCookieSecure())
                .sameSite("Strict")
                .path("/");
        if (remember) {
            Duration maxAge = Duration.between(java.time.Instant.now(), expiresAt);
            cookie.maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge);
        }
        return cookie.build().toString();
    }

    private String expiredCookie() {
        return ResponseCookie.from(properties.getAuth().getCookieName(), "")
                .httpOnly(true)
                .secure(properties.getAuth().isCookieSecure())
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 6, max = 200) String password,
            boolean remember) {
    }

    public record CsrfResponse(String token) {
    }

    public record AuthError(String message) {
    }
}
