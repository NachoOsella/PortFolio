---
title: Markdown-first Portfolio
slug: portfolio
description: "I built this portfolio as a Markdown content platform with a React public site, a Spring Boot Studio API, and explicit GitHub backups."
status: published
ink: yellow
featured: false
projectType: Content platform
role: I designed and engineered the public site and Studio
duration: Ongoing
technologies:
  - React 19
  - TypeScript 5.8
  - Vite 7
  - React Markdown
  - Zod
  - Spring Boot 3.4.5
  - Java 21
  - Docker
  - Caddy
repositoryUrl: https://github.com/NachoOsella/portfolio
publishedAt: 2026-08-03
updatedAt: 2026-08-03
displayOrder: 5
---

# Overview

I built this portfolio because I wanted my work to remain portable. Every project, article, and page is a Markdown file with YAML frontmatter. The public React site renders those files, the private Studio edits them, the Spring Boot API validates and writes them, and GitHub receives an explicit backup when I ask it to.

I did not want a CMS database whose export would become a future migration project. I wanted files I could open in Neovim, review in Git, move to another renderer, or keep editing if this frontend disappeared.

## I made the file format the contract

The frontend parses Markdown and validates its frontmatter with Zod. The backend validates the same conceptual contract independently with Jackson YAML and Java rules. The implementations are separate, so I have to keep both validators aligned, but the boundaries stay clear: projects, posts, and pages require different metadata, publication states are explicit, and invalid writes fail before they reach disk.

I preserve unknown frontmatter keys when I edit known metadata. That small decision matters because content often grows custom fields before the editor knows about them. An editor should not silently erase information merely because it has not learned how to display it yet.

## I kept the Studio replaceable

The browser talks to repository interfaces rather than reading remote content inside page components. With the API enabled, TanStack Query uses the Spring Boot adapter. Without it, the mock repository persists documents in versioned browser storage and the same UI remains testable without a server. During the static build, the repository reads the real local Markdown files through Node so the prerendered HTML does not depend on a running API.

The Studio can create, update, rename, delete, import, export, and preview files. I keep drafts and browser persistence behind those repository and service boundaries instead of making the pages responsible for storage decisions.

## I put writes and secrets on the backend

The backend has no database. It restricts paths to `content/projects/*.md`, `content/posts/*.md`, and `content/pages/*.md`, limits document size, validates frontmatter, stamps `updatedAt`, and writes to the configured local directory. It also hashes files to detect local changes.

I keep authentication there as well. Users are configured with bcrypt hashes, sessions use opaque in-memory tokens delivered through `HttpOnly` cookies, mutating requests require CSRF protection, and login attempts are rate-limited. The browser never receives `GITHUB_TOKEN`, password hashes, or repository credentials. The mock login is intentionally only a development and test boundary.

## I made GitHub an explicit destination

The local content directory is the working source for the application. The GitHub Contents API is optional and only runs from the Studio push action. The backend sends detected added, modified, and deleted files to the configured branch, then records the local sync baseline. Pull is deliberately a no-op because I do not want the live site to change underneath a local edit.

That design also keeps the limitation visible: the current API pushes all detected local changes together, and the process-local history is not a replacement for GitHub's real history. I prefer a clear boundary to a fake Git abstraction.

## I made the build part of the editorial system

The production build renders the public routes with React 19 streaming and the same content repository used by the browser. It writes prerendered HTML, generates `robots.txt` and `sitemap.xml` from the Markdown routes, creates an Open Graph image, and lets Caddy serve the static surface while proxying `/api` to Spring Boot.

I also designed the public layer around accessible, reduced-motion-aware interactions: square controls, visible focus, keyboard support, readable Markdown, project diagrams, and motion that explains hierarchy without becoming a gate between a reader and the content.

## What I learned

The most durable content system is not the one with the most editing features. It is the one with the lowest exit cost. By keeping the work in readable files and treating React, Spring Boot, the mock repository, and GitHub as adapters around those files, I made the architecture easier to replace and the writing harder to lose.
