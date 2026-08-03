package com.ignacio.portfolio.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String corsAllowedOrigin = "http://localhost:5173";
    private final Auth auth = new Auth();

    public String getCorsAllowedOrigin() {
        return corsAllowedOrigin;
    }

    public void setCorsAllowedOrigin(String corsAllowedOrigin) {
        this.corsAllowedOrigin = corsAllowedOrigin;
    }

    public Auth getAuth() {
        return auth;
    }

    public static class Auth {
        private String users = "";
        private String cookieName = "portfolio_session";
        private boolean cookieSecure;
        private Duration sessionTtl = Duration.ofHours(12);

        public String getUsers() {
            return users;
        }

        public void setUsers(String users) {
            this.users = users;
        }

        public String getCookieName() {
            return cookieName;
        }

        public void setCookieName(String cookieName) {
            this.cookieName = cookieName;
        }

        public boolean isCookieSecure() {
            return cookieSecure;
        }

        public void setCookieSecure(boolean cookieSecure) {
            this.cookieSecure = cookieSecure;
        }

        public Duration getSessionTtl() {
            return sessionTtl;
        }

        public void setSessionTtl(Duration sessionTtl) {
            this.sessionTtl = sessionTtl;
        }
    }
}
