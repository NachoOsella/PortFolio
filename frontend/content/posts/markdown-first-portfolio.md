---
title: Files are the feature — why this portfolio is Markdown-first
slug: markdown-first-portfolio
description: How this site keeps projects, writing, and pages in validated Markdown files while a React Studio and Spring Boot API remain replaceable adapters around them.
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
seoTitle: Building a Markdown-first portfolio with React and Spring Boot
seoDescription: Content files as the source of truth, Zod-validated frontmatter, a private React editor, local drafts, and explicit GitHub backups.
---

# I wanted content I could keep

Portfolio rewrites often begin with a new component library and end with the same stale project descriptions trapped in another application. I wanted the opposite: content durable enough to outlive this frontend.

Every project, article, and static page on this site is a plain Markdown file with YAML frontmatter. React renders it, a private Studio edits it, Spring Boot validates and saves it, and GitHub can back it up — but none of those layers owns it.

```text
frontend/content/
  pages/
    about.md
    now.md
    uses.md
  posts/
    lembas-modular-monolith.md
    ...
  projects/
    lembas.md
    ...
```

That decision sounds small. It simplified almost everything that followed.

## Frontmatter is an API

Markdown bodies are flexible; a project index is not. It needs a title, slug, description, publication status, technology list, and predictable dates. I treat frontmatter as an API contract and validate it with Zod:

```ts
const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  technologies: z.array(z.string()).min(1),
  featured: z.boolean(),
  repositoryUrl: z.string().url().optional(),
  updatedAt: z.coerce.string(),
});
```

Invalid content fails at the boundary with a useful message. Components never need to guess whether `technologies` is a comma-separated string this week or an array next week. The editor uses the same schema as the public repository adapter, so preview and production agree.

## The Studio is an adapter

The private `/admin` workspace can create and edit projects, posts, and pages; preview rendered Markdown; validate YAML; import and export files; inspect changes; and push selected updates to GitHub when the backend is enabled.

It is intentionally not a CMS database. If the API is unavailable, the Studio falls back to browser-local drafts. If the Studio disappears forever, every article remains editable in Neovim. Export produces the same file the repository expects, not a proprietary document shape.

That distinction changed how I designed features. Autosave writes a draft, not "the content." Preview parses the current text through the production parser. Rename is a filesystem operation with slug validation, not an update against a hidden row id.

## Why Spring Boot is involved at all

A static site could import the Markdown at build time, and the public experience effectively does. The backend exists for the private workflow: authenticated writes, local file persistence, validation, status inspection, and explicit GitHub Contents API backups.

Credentials stay on that boundary. Users are configured as bcrypt hashes through environment variables; repository tokens never enter the browser bundle. The frontend asks for a session and receives authorization decisions, not secrets.

GitHub is a backup target rather than the live database. Pushing is an explicit action with a selected set of changed Markdown files. Local writing remains fast and does not fail because a third-party API is unavailable.

## Repository interfaces keep the UI honest

The React application talks to repository interfaces, with an HTTP adapter for the Spring Boot API and an in-memory Markdown-backed fallback for development and tests. TanStack Query handles remote state, but components do not know whether a project came from `fetch`, an imported file, or a bundled seed.

This also made the private workspace demonstrable without handing out admin credentials. The mock implementation supports the same create, rename, delete, and list operations; tests exercise behavior rather than networking details.

## Rendering is the last step, not the source

The public side uses React Markdown with GitHub-flavored Markdown and syntax highlighting. Rendering only happens after parsing and schema validation. Raw HTML is not required for the content I write, which keeps the trust model smaller.

Publication states are content data, not route tricks:

- `published` appears publicly.
- `draft` stays in Studio.
- `scheduled` carries editorial intent.
- `archived` remains available for history without filling the public index.

## What this architecture cost

Files are not free. Concurrent editing needs conflict handling; renames affect paths; searching thousands of documents would eventually need an index; and a mounted local directory makes deployment constraints explicit. For one author and dozens of documents, those are better problems than schema migrations, content exports, and a database that exists only to store Markdown strings.

I would choose differently for a newsroom. A personal portfolio benefits from the lowest possible exit cost.

## The test for ownership

My rule became: if I delete the interface, do I still own the work? Here the answer is yes. The projects are readable files, Git tracks every revision, and any text editor can change them.

The files are not a storage implementation hidden behind the product. They are the feature. Everything else is a replaceable, hopefully useful adapter.
