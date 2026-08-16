package com.ignacio.portfolio.auth;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();
    private static final String USER_LINE =
            "author@example.com|" + ENCODER.encode("correct-password") + "|Author Name";

    @DynamicPropertySource
    static void authProperties(DynamicPropertyRegistry registry) throws java.io.IOException {
        registry.add("app.auth.users", () -> USER_LINE);
        final var root = java.nio.file.Files.createTempDirectory("portfolio-content-test");
        registry.add("content.root", () -> root.toString());
    }

    @Autowired
    MockMvc mockMvc;

    @Test
    void loginIssuesAnHttpOnlySessionCookie() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {"email":"author@example.com","password":"correct-password","remember":false}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("HttpOnly")))
                .andExpect(jsonPath("$.name").value("Author Name"));
    }

    @Test
    void loginRejectsWrongCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {"email":"author@example.com","password":"wrong-password","remember":false}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void mutatingEndpointsRequireTheCsrfHeader() throws Exception {
        // No CSRF token: Spring Security denies the request before the controller runs.
        mockMvc.perform(post("/api/content/files")
                        .contentType("application/json")
                        .content("""
                                {"collection":"pages","filename":"x.md","raw":"---\ntitle: X\nslug: x\n---\n"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginIsRateLimitedAfterRepeatedAttempts() throws Exception {
        for (int attempt = 0; attempt < 10; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .contentType("application/json")
                            .content("""
                                    {"email":"victim@example.com","password":"wrong-password","remember":false}
                                    """))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {"email":"victim@example.com","password":"wrong-password","remember":false}
                                """))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void sessionEndpointReturnsTheAuthenticatedUserAndAnonymityWithoutCookie() throws Exception {
        mockMvc.perform(get("/api/auth/session"))
                .andExpect(status().isNoContent());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {"email":"author@example.com","password":"correct-password","remember":false}
                                """))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("portfolio_session"))
                .andReturn();

        jakarta.servlet.http.Cookie sessionCookie = login.getResponse().getCookie("portfolio_session");

        mockMvc.perform(get("/api/auth/session").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Author Name"));

        mockMvc.perform(post("/api/auth/logout").with(csrf()).cookie(sessionCookie))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/session").cookie(sessionCookie))
                .andExpect(status().isNoContent());
    }

    @Test
    void mutatingContentRequiresAnAuthenticatedSession() throws Exception {
        mockMvc.perform(post("/api/content/files")
                        .with(csrf())
                        .contentType("application/json")
                        .content("""
                                {"collection":"pages","filename":"x.md","raw":"---\ntitle: X\nslug: x\n---\n"}
                                """))
                .andExpect(status().isUnauthorized());
    }
}