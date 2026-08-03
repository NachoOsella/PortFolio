# Ignacio Osella Portfolio + Markdown Studio

A premium React/Vite portfolio and Markdown content management client for Ignacio Osella, a full-stack developer focused on React, TypeScript, Java, Spring Boot, relational databases, Docker, and web application architecture.

The public website is the product. The private Studio workspace uses repository interfaces so it can run against the Spring Boot API backed by GitHub, with a local mock fallback for isolated frontend development.

## Technology stack

- React 19, TypeScript, Vite, pnpm
- A hand-written custom design system in CSS (no utility framework, no shadcn)
- React Router, TanStack Query, Motion for React
- React Hook Form, Zod, Lucide React
- React Markdown, remark-gfm
- Vitest, jsdom, React Testing Library

## Installation

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The development server runs on the Vite default port. Build the production bundle with `pnpm build`.

## Commands

```bash
pnpm dev          # Start Vite
pnpm build        # TypeScript build and production bundle
pnpm preview      # Preview the production bundle
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Vitest run
pnpm test:watch   # Vitest watch mode
```

## Environment variables

```env
VITE_API_URL=http://localhost:8080/api
```

When `VITE_API_URL` is set, content, authentication, and Git adapters call the Spring Boot backend. The backend reads local Markdown files and uses GitHub only for explicit pushes. Remove it to use the local mock fallback.

## Folder structure

```text
content/
├── projects/        # Project Markdown files
├── posts/           # Blog Markdown files
└── pages/           # Static page Markdown files
src/
├── app/             # Router and app metadata
├── components/      # Public, Markdown, editor, and UI components
├── context/         # Query and mock auth providers
├── hooks/           # Repository query hooks and public content hooks
├── layouts/         # Public and protected admin layouts
├── lib/             # Markdown, frontmatter, date, and reading utilities
├── mocks/           # Seed Markdown imports, messages, and Git history
├── pages/           # Public and admin route composition
├── repositories/    # Repository interfaces, API adapters, and local mock fallback
├── schemas/         # Strict Zod frontmatter schemas
├── services/        # Downloads, drafts, and message persistence
├── styles.css       # Global reset, fonts, and accessibility defaults
├── styles/          # Public v2 and admin Gruvbox styling
└── types/           # Domain types and API contracts
```

## Markdown content format

Every content file begins with YAML frontmatter followed by a Markdown body. The frontend treats the raw file as canonical. Unknown frontmatter properties are preserved when a known field is edited.

### Project frontmatter

```md
---
title: Modular ERP Platform
slug: modular-erp
description: A reusable ERP foundation designed for small and medium businesses.
status: published
featured: true
projectType: Full-stack application
role: Full-stack developer
duration: Ongoing
technologies:
  - React
  - TypeScript
  - Spring Boot
updatedAt: 2026-07-28
---

# Overview

Markdown content goes here.
```

### Blog frontmatter

```md
---
title: Building reusable feature modules in React
slug: react-feature-architecture
description: A practical approach to organizing maintainable React applications.
status: published
featured: true
category: React
tags:
  - React
  - TypeScript
publishedAt: 2026-07-20
updatedAt: 2026-07-25
---
```

Blog posts with `draft`, `archived`, or future `scheduled` statuses never appear on public routes.

### Page frontmatter

```md
---
title: About
slug: about
description: More about Ignacio Osella and his development approach.
status: published
updatedAt: 2026-07-25
---
```

## Markdown import and export

The Studio file manager accepts `.md` files through a native browser file input. It reads the file in the browser, parses and validates frontmatter, detects a collection from the metadata, and writes it to the mock content repository. Conflicting paths require explicit overwrite behavior in the repository contract.

Exports preserve YAML frontmatter, Markdown formatting, unknown metadata, and UTF-8 content. The export-all action is a ZIP-style mock archive represented as a downloadable text bundle because no backend or filesystem is present.

## Local mock persistence

When `VITE_API_URL` is absent, `contentRepository`, `gitRepository`, `authRepository`, message persistence, and draft persistence use versioned localStorage keys behind service/repository boundaries. When it is present, content, authentication, and Git calls use the backend; drafts remain browser-local. Pages and components do not read localStorage directly for remote content.

The mock fallback simulates promise latency, CRUD operations, version numbers, modified timestamps, synchronization states, and opt-in recoverable failures via the browser console:

```js
localStorage.setItem('ignacio-mock-errors', 'true');
```

## Authentication and Git behavior

With the API adapter enabled, login is owned by Spring Boot. The browser receives only an HttpOnly session cookie and never sees the configured user hashes or GitHub token. Without the API adapter, the login screen falls back to the intentionally insecure mock used by frontend tests.

Content saves are written to the backend's local Markdown directory first. The Studio Git screen reports those local changes and pushes them to GitHub only when requested. The browser never executes Git commands or stores repository credentials.

## Synchronization states

The content types distinguish the following states:

- `local-draft`: an editor-only autosave exists.
- `modified`: saved frontend state differs from the mock server baseline.
- `syncing`: a future server request is in flight.
- `synced`: local state matches the mock server.
- `commit-required`, `committed`, `push-required`, `pushed`: Git workflow states.
- `conflict` and `error`: recoverable exceptional states that future API responses can expose.

## Spring Boot API adapter

The adapters in `src/repositories/apiRepositories.ts` implement the same repository interfaces as the mock adapters. TanStack Query hooks remain the UI data boundary.

```text
React frontend
    ↓ REST API + HttpOnly cookie
Spring Boot backend
    ↓ GitHub Contents API
GitHub repository / frontend/content/*.md
```

The backend, not the browser, parses and validates Markdown, owns authentication, holds the GitHub token, and writes commits. See [`../backend/README.md`](../backend/README.md) for environment setup and the complete endpoint contract.

## Production build

```bash
pnpm build
pnpm preview
```

The Vite SPA is structured so a prerendering layer can add route metadata later. `Seo` updates document title, description, and canonical URL on the client while keeping the abstraction ready for server or prerendered metadata.
