package com.ignacio.portfolio.auth;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ignacio.portfolio.config.AppProperties;

public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final SessionService sessionService;
    private final String cookieName;

    public SessionAuthenticationFilter(SessionService sessionService, AppProperties properties) {
        this.sessionService = sessionService;
        this.cookieName = properties.getAuth().getCookieName();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = cookieValue(request.getCookies());
        AuthUser user = sessionService.findUser(token);
        if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var authentication = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    java.util.Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private String cookieValue(Cookie[] cookies) {
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
