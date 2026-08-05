# AGENTS.md

## Commands

Run frontend commands from `frontend/`; there is no root package task runner.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
pnpm preview
pnpm format
```

Run backend commands from `backend/`:

```bash
mvn test
mvn spring-boot:run
```

Before completing a change, run the relevant targeted tests and the full validation set:

```bash
cd frontend && pnpm lint && pnpm test && pnpm build
cd ../backend && mvn test
```

For the integrated local deployment, use `docker compose up --build`; inspect it with
`docker compose config`, `docker compose logs -f backend`, or `docker compose logs -f web`.

## Architecture Boundaries

- `frontend/content/` is the canonical content source: Markdown body plus YAML frontmatter.
- Frontend parsing and serialization live in `frontend/src/lib/content.ts`; collection contracts live in `frontend/src/schemas/content.ts` and `frontend/src/types/`.
- The Spring Boot parser in `backend/src/main/java/com/ignacio/portfolio/content/MarkdownParser.java` independently validates the same content contract. Change frontend schema/types, backend validation, and their tests together when metadata changes.
- Frontend pages and components use repository interfaces and hooks in `frontend/src/repositories/` and `frontend/src/hooks/`; the API adapters and local mock fallback must keep the same contracts.
- The backend owns authentication, CSRF, local filesystem writes, and GitHub backup operations. The browser must not implement those responsibilities.
- The backend has no database. Content mutations are raw Markdown requests validated before writing to the configured content directory.

## Development Rules

- Preserve unknown frontmatter keys when editing known metadata; use `parseMarkdown()` and `buildMarkdown()` instead of ad-hoc YAML manipulation.
- Keep public rendering and Studio preview on the shared Markdown renderer/parser path.
- Keep browser-only persistence behind the existing repository/service boundaries; do not read or write remote content directly from page components.
- Use `frontend/DESIGN.md` for visual-system decisions and `frontend/PRODUCT.md` for product behavior and accessibility requirements.
- Keep secrets and deployment configuration in environment files; `.env` files are ignored and must not be committed.

## Testing

- Frontend unit and component tests are under `frontend/src/**/*.test.*`; Markdown behavior belongs in `frontend/src/lib/content.test.ts` or `frontend/src/test/markdown.test.tsx`.
- Backend tests are under `backend/src/test/java/` and run with Maven; they cover frontmatter validation, content behavior, and configured authentication.
- When changing the API contract, validate both repository adapters and the Spring Boot controller/service tests.

## Safety and Constraints

- Never expose `GITHUB_TOKEN`, `APP_AUTH_USERS`, bcrypt hashes, or backend session secrets to frontend code or browser storage.
- Never treat the local mock authentication as secure; production authentication remains the Spring Boot boundary.
- Do not bypass frontmatter validation to make invalid content publishable. Repair the Markdown or update both validators and their tests.
- Do not commit `dist/`, `target/`, `node_modules/`, coverage output, or environment files.

## References

- `README.md`: repository setup, routes, content model, and architecture overview.
- `frontend/README.md`: frontend conventions, mock persistence, and Markdown formats.
- `backend/README.md`: API, security, environment, and backend development details.
- `docker/README.md`: Docker Compose and Dokploy deployment procedures.
