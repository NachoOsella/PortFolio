---
title: Markdown-first Portfolio
slug: portfolio
description: This site — a Markdown-first portfolio with a private Studio for editing content, built with React 19, Spring Boot, and the GitHub Contents API.
status: published
ink: yellow
featured: false
projectType: Content platform
role: Design and engineering
duration: Ongoing
technologies:
  - React 19
  - TypeScript
  - Vite 7
  - Tailwind CSS 4
  - Spring Boot 3.4
  - Docker
  - Caddy
repositoryUrl: https://github.com/NachoOsella/portfolio
publishedAt: 2026-08-03
updatedAt: 2026-08-03
displayOrder: 5
---

# Overview

This portfolio is a Markdown-first content platform. Every project, article, and page you can read on it is a file with YAML frontmatter — validated against Zod schemas, rendered through a restrained Gruvbox-inspired visual system, and editable from a private Studio workspace at `/admin`.

## Key decisions

- **Files are the source of truth.** The Spring Boot backend stores Markdown in a mounted local directory. It validates files and uses the GitHub Contents API only for explicit backup pushes — there is no database copy of the content to drift away from the files.
- **The editor is an adapter, not an owner.** The Studio can create, edit, preview, import, and export content, and it falls back to local drafts when the API is disabled. Losing the backend never means losing the writing.
- **Credentials stay server-side.** Users are bcrypt hashes in environment variables; the browser never receives repository tokens or password hashes.
- **Motion with restraint.** Kinetic typography and pointer-reactive geometry on the home page, with reduced-motion support and accessible interaction states throughout.

## What I built

React 19 + TypeScript frontend on Vite 7 with TanStack Query, React Hook Form, Zod, and React Markdown with remark-gfm and rehype-highlight. Repository interfaces with API adapters and a mock fallback keep the UI testable without a backend. The Spring Boot 3.4 API handles validation, persistence, and GitHub integration. Docker Compose and Caddy close the loop for deployment, with Vitest and React Testing Library on the testing side.

## Lessons learned

A content site gets calmer when the file format wins every argument. Once frontmatter had a schema and the filesystem had the final word, every other decision — drafts, previews, backups, imports — became an adapter problem instead of a data problem.
