# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is split between hiring teams assessing a full-stack developer and freelance clients evaluating product-thinking and delivery confidence. Visitors are looking for credible evidence of Ignacio Osella's technical depth, communication, and ability to build maintainable web products.

The secondary user is Ignacio himself, using the private CMS to author, review, synchronize, and publish Markdown content through the Spring Boot backend.

## Product Purpose

This product is a premium personal portfolio and Markdown content management frontend for Ignacio Osella, a full-stack developer based in Córdoba, Argentina. Public visitors should quickly understand his positioning, inspect selected work, read useful technical writing, and make contact. The admin experience should make Markdown-based publishing and Git-oriented workflows feel tangible without pretending browser operations are secure or server-backed.

## Positioning

The portfolio proves technical depth through the way its own content system is structured: public case studies and articles are authored as real Markdown, rendered consistently in the public site and admin preview, and exposed through repository abstractions backed by the Spring Boot filesystem and Git API.

## Operating Context

The public experience is read on phones and laptops by people evaluating work, architecture, and communication. The admin experience is used in a browser by one content owner who edits Markdown, reviews metadata, imports and exports files, reviews synchronization state, and prepares Git commits that the backend pushes.

## Capabilities and Constraints

- Public routes cover the home page, project index and case studies, blog index and articles, about, contact, login, and not-found states.
- Protected admin routes cover overview, content, projects, posts, pages, files, Git, messages, and settings.
- All content is represented as Markdown files with YAML frontmatter; there is no database model.
- Development runs against local mock repositories that persist in localStorage; production builds call the Spring Boot REST API. Mock code is excluded from production bundles.
- The frontend must not write to a server filesystem, execute Git, store credentials, or imply that browser-only authentication is secure.
- The Java/Spring Boot service owns authentication, authorization, filesystem writes, Git operations, repository credentials, conflicts, backups, and audit logs. The browser never touches these.
- English is the public content language.

## Brand Commitments

- Product name and author: Ignacio Osella.
- Voice: calm, precise, editorial, technically fluent, and understated.
- Visual direction: premium minimalism with subtle Arch Linux and terminal-culture references, never a fake terminal interface.
- Gruvbox Material Dark Hard is the permanent public palette: hard dark ground, warm foreground type, restrained rules, and semantic yellow, green, blue, orange, aqua, red, and purple accents.
- Public typography uses Archivo Variable for display and Manrope Variable for body copy, with monospace reserved for technical metadata.
- Motion is a primary expression layer: kinetic type, pointer-responsive geometry, and a pinned horizontal project gallery, all with reduced-motion fallbacks.
- Avoid generic portfolio tropes, fake screenshots, terminal cosplay, skill percentage bars, logo clouds, excessive gradients, blobs, overuse of pills, and default shadcn styling.

## Evidence on Hand

The product brief supplies the factual positioning, technology focus, route requirements, future API contract, content architecture, and security boundary. The first release should use authored synthetic portfolio projects, articles, pages, contact messages, and Git history. It must not fabricate testimonials, customer logos, benchmarks, or commercial claims.

## Product Principles

- Show technical depth through working content and clear architecture, not claims alone.
- Keep Markdown canonical and make public rendering match admin preview.
- Make state visible: local draft, saved mock state, synchronized server, committed Git, and pushed remote are distinct.
- Preserve a clean boundary between browser simulation and backend responsibility.
- Make every public interaction useful, accessible, and calm.

## Accessibility & Inclusion

Use semantic HTML, keyboard-accessible controls, visible focus states, labelled forms, sufficient contrast, accessible dialogs and status announcements, correct heading hierarchy, skip navigation, and reduced-motion support. Responsive behavior must remain usable on small phones through wide desktop screens.
