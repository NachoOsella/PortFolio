# Portfolio backend

The backend is a Spring Boot REST API. It deliberately has no database; Markdown files live in the configured local content directory. GitHub is an optional remote backup used only when an administrator explicitly pushes local changes.

## Architecture

```text
React frontend
      |
      | REST + HttpOnly session cookie
      v
Spring Boot API
      |
      | local content directory
      v
frontend/content/*.md
      |
      | explicit Studio push
      v
GitHub repository backup
```

The service reads and writes Markdown files from the configured local content directory, validating YAML frontmatter on every write. The GitHub Contents API is used only by the explicit push action in the Studio. There is no GitHub request during public content rendering.

Authentication users are loaded at startup from `APP_AUTH_USERS`. Passwords must be bcrypt hashes; they are never stored in Markdown, GitHub, or browser storage. Sessions are opaque random tokens held in process memory and sent in a `Secure`/`HttpOnly` cookie in production. A restart invalidates active sessions.

## Requirements

- Java 21
- Maven 3.9+
- A GitHub fine-grained token with repository `Contents: Read and write` permission when remote backup/push is needed

## Configuration

Copy the example file and export it before starting Spring Boot. Spring Boot does not load `.env` files automatically:

```bash
cp .env.example .env
set -a
. ./.env
set +a
mvn spring-boot:run
```

Generate a bcrypt password hash with Apache `htpasswd`:

```bash
htpasswd -bnBC 12 '' 'your-password' | tr -d ':\\n'
```

Put the generated hash in a quoted `APP_AUTH_USERS` entry:

```env
APP_AUTH_USERS='owner@example.com|$2y$12$...|Portfolio owner,editor@example.com|$2y$12$...|Editor'
```

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_OWNER` | only for pushes | GitHub account or organization |
| `GITHUB_REPOSITORY` | only for pushes | Repository containing the portfolio |
| `GITHUB_TOKEN` | only for pushes | Fine-grained token, kept only by the backend; leave it empty when GitHub backup is disabled |
| `GITHUB_BRANCH` | no | Branch to read and modify, defaults to `main` |
| `GITHUB_CONTENT_ROOT` | no | Remote directory used for pushes, defaults to `frontend/content` |
| `CONTENT_ROOT` | no | Local Markdown directory, defaults to `/app/content` |
| `APP_AUTH_USERS` | yes | Comma-separated `email|bcryptHash|displayName` entries |
| `APP_CORS_ALLOWED_ORIGIN` | no | Frontend origin, defaults to `http://localhost:5173` |
| `APP_AUTH_COOKIE_SECURE` | no | Set `true` behind HTTPS; defaults to `false` locally |
| `APP_AUTH_SESSION_TTL` | no | In-memory session lifetime, defaults to `PT12H` |

The application fails fast if users are missing or malformed. GitHub owner and repository are required only when pushing local changes; `GITHUB_TOKEN` is required for pushes. The health endpoint can still be used for deployment diagnostics.

## API

All URLs are relative to `/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/auth/csrf` | public | Creates/returns the CSRF token cookie |
| `POST` | `/auth/login` | public | Logs in a configured user |
| `GET` | `/auth/session` | public | Returns the current session or `204` |
| `POST` | `/auth/logout` | public | Revokes the current session |
| `GET` | `/content/files` | public/admin | Lists Markdown summaries; anonymous callers only see published content |
| `GET` | `/content/file?path=...` | public/admin | Reads one Markdown document |
| `POST` | `/content/files` | admin | Creates a local Markdown document |
| `PUT` | `/content/file` | admin | Validates and updates a document |
| `POST` | `/content/import` | admin | Imports or overwrites a document |
| `POST` | `/content/rename` | admin | Renames a local Markdown document |
| `DELETE` | `/content/file?path=...` | admin | Deletes a local Markdown document |
| `GET` | `/git/status` | admin | Returns the live branch state |
| `GET` | `/git/history` | admin | Returns commits created by local push actions in the current process |
| `POST` | `/git/pull` | admin | No-op; local Markdown remains the source of truth |
| `POST` | `/git/push` | admin | Pushes local added, modified, and deleted files to GitHub |

Mutating requests other than login and logout require the `X-XSRF-TOKEN` header matching the `XSRF-TOKEN` cookie. Call `GET /api/auth/csrf` before the first mutation. CORS is restricted to the configured frontend origin.

Logical content paths are restricted to these collections:

```text
content/projects/*.md
content/posts/*.md
content/pages/*.md
```

The default GitHub mapping is `content/projects/example.md` to `frontend/content/projects/example.md`.

## Development

```bash
mvn test
mvn spring-boot:run
```

The tests cover frontmatter validation and environment-based user parsing without requiring a database or a GitHub request. The actuator health endpoint is available at `/actuator/health`.
