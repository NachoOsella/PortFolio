package com.ignacio.portfolio.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "github")
public class GitHubProperties {

    private String apiUrl = "https://api.github.com";
    private String owner = "";
    private String repository = "";
    private String token = "";
    private String branch = "main";
    private String contentRoot = "frontend/content";
    private Duration timeout = Duration.ofSeconds(15);

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getRepository() {
        return repository;
    }

    public void setRepository(String repository) {
        this.repository = repository;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getContentRoot() {
        return contentRoot;
    }

    public void setContentRoot(String contentRoot) {
        this.contentRoot = contentRoot;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }
}
