---
title: A small, honest authentication boundary in Spring Boot
slug: spring-boot-authentication
description: What the browser should never own, and how a backend boundary keeps the model honest.
status: published
ink: blue
category: Spring Boot
tags:
  - Java
  - Spring Boot
  - Security
publishedAt: 2026-06-29
updatedAt: 2026-07-02
seoTitle: A small authentication boundary in Spring Boot
seoDescription: Keep authentication responsibilities on the server with a clear HTTP boundary.
---

# Authentication is a server responsibility

A browser can remember that a user is signed in. It cannot make a browser-only credential flow secure.

## The boundary

The frontend should ask the backend for a session and receive a secure HttpOnly cookie. It should not receive repository tokens, filesystem credentials, or a promise that localStorage is a vault.

## Make failure legible

Expired sessions, insufficient permissions, and network failures are different states. The UI should say which one happened and what the user can do next.

```java
@RestController
class SessionController {
    @GetMapping("/api/auth/session")
    SessionResponse session() {
        return sessionService.current();
    }
}
```

## Conclusion

Security gets easier to reason about when each layer owns a small, explicit part of the problem.
