---
title: I kept this portfolio as a set of Markdown files
slug: markdown-first-portfolio
description: "I explain why I made Markdown the source of truth here, then built React, Spring Boot, a local Studio, and GitHub backups around it."
status: published
ink: yellow
category: Architecture
tags:
  - React
  - Markdown
  - Content systems
  - Spring Boot
publishedAt: 2026-08-03
updatedAt: 2026-08-03
seoTitle: I built a Markdown-first portfolio with React and Spring Boot
seoDescription: "I keep content in validated Markdown files and use a React Studio, a Spring Boot API, local drafts, and explicit GitHub backups as replaceable adapters."
---

# I wanted content I could keep

I have rebuilt enough small sites to recognize the pattern: a new interface arrives, the project descriptions get copied into it, and six months later the writing is trapped inside the thing that was supposed to present it. I wanted the opposite.

Every project, article, and page on this site is a Markdown file with YAML frontmatter. React renders it, the Studio edits it, Spring Boot validates and writes it, and GitHub can receive a backup. None of those layers is allowed to become the only place where the work exists.

If I remove the interface, I still want to own the words.

## I made frontmatter an API contract

Markdown gives me a flexible body, but an index needs reliable metadata. A project needs a title, slug, publication state, technology list, and dates. A post needs a category, tags, and a publication date. I validate those shapes at the boundary instead of making each component guess what a field means today.

The frontend uses Zod in `parseMarkdown()`. The backend uses an independent Jackson YAML parser and Java validation rules. They do not share one executable schema, so I treat the contract as something I must keep aligned across both sides. The duplication is intentional and visible; the alternative would be pretending the browser is the only parser that matters.

I also preserve unknown frontmatter keys when I edit known metadata. Content grows faster than editors do, and an editor should not erase a field merely because its form has not learned about it yet.

## I made the Studio an adapter

The private Studio can create, edit, rename, delete, import, export, and preview Markdown. Page components do not decide whether a document came from the API, the local mock, an imported file, or the filesystem during prerendering. They ask repository interfaces for content and let the adapter answer.

When `VITE_API_URL` is present, the frontend uses the Spring Boot API. When it is absent, the mock repository persists documents in versioned browser storage and simulates the same CRUD boundary for development and tests. During the static build, the repository reads real files with Node so the generated HTML reflects the content I actually committed.

That separation keeps the UI honest. A draft is a draft regardless of which adapter served it, and a parser error is a content problem rather than a component problem.

## I put the filesystem behind a guarded backend

The backend has no database. It reads and writes a configured local content directory, restricts logical paths to the three collections, rejects unsafe traversal, enforces a 512 KB document limit, validates frontmatter, stamps `updatedAt`, and calculates SHA-256 hashes to detect local changes.

I keep authentication on that same boundary. Users are configured with bcrypt hashes; sessions use opaque random tokens held in memory and delivered through `HttpOnly` cookies; mutating requests require CSRF protection; login attempts are rate-limited; and CORS is restricted to the configured origin. The browser never sees repository credentials or password hashes.

Those details are not an attempt to turn a portfolio into a security product. They are the minimum I wanted before giving a browser the ability to write files.

## I made GitHub an explicit backup

I use the GitHub Contents API only when I explicitly push from the Studio. The backend compares local hashes, sends added, modified, and deleted Markdown files to the configured branch, and marks the local baseline as synchronized. Public rendering does not ask GitHub for content.

I also made pull a no-op. Local Markdown remains the working source for the running application, so a remote update cannot silently overwrite a local edit. The current push operation sends all detected local changes together, and its process-local history disappears on restart; GitHub remains the durable history rather than a fake history reconstructed by the API.

## I made the build part of the content system

The production build first creates the Vite bundle, then prerenders every public route with React 19 streaming. The prerender pass reads the real Markdown through the repository contract, writes route-level HTML, generates `robots.txt` and `sitemap.xml`, and creates the social preview image. Caddy serves the static surface and proxies `/api` to Spring Boot.

That gives me a useful property: a reader or crawler can receive meaningful content before client-side JavaScript finishes loading. It also gives me one rendering path to maintain instead of a special build-only copy of every page.

## What this architecture costs

Files are not free. Renames affect paths, concurrent editing needs a clearer conflict strategy, and searching thousands of documents would eventually deserve an index. The backend currently returns a conflict when the remote file changes rather than resolving it, and the API intentionally does not pretend to be a full Git client.

For a personal portfolio, I prefer those limits to a content database I cannot easily leave. My scale is dozens of documents and one author. The lowest exit cost is more valuable to me than an abstraction designed for a newsroom I do not have.

## What I learned

A content platform becomes calmer when the file format wins every argument. Once I made Markdown the source of truth, drafts, previews, validation, exports, static rendering, authentication, and backups became adapter problems with clear edges.

The files are not a storage implementation hidden behind the product. They are the product. Everything else is a replaceable way of reading, editing, validating, or backing them up.
