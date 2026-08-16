# Docker deployment

The root [`docker-compose.yml`](../docker-compose.yml) starts the Spring Boot API and a Caddy container that serves the built React application and proxies `/api` to the backend. The host `frontend/content` directory is mounted into the backend as the local content source.

```text
Browser
  |
  v
Caddy :80 or HTTPS
  |              \
  |               React static files
  v
Spring Boot :8080
  |
  v
GitHub Contents API
```

## Run locally

Create the backend environment file first:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with authentication settings and optional GitHub backup settings.
docker compose up --build
```

Open `http://localhost`. The backend is not published directly; Caddy is the only public container port. Public pages read the mounted local `frontend/content` directory; GitHub is contacted only when you push from the Studio.

`backend/.env` is intentionally ignored by Git. It contains `GITHUB_TOKEN` and `APP_AUTH_USERS` and must never be committed.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEB_PORT` | `80` | Host HTTP port exposed by Caddy |
| `WEB_HTTPS_PORT` | `443` | Host HTTPS port exposed by Caddy |
| `SITE_ADDRESS` | `:80` | Caddy site address; set to a domain to enable automatic HTTPS |
| `APP_CORS_ALLOWED_ORIGIN` | `http://localhost` | Origin accepted by the API |

`WEB_PORT`, `SITE_ADDRESS`, and `APP_CORS_ALLOWED_ORIGIN` can be supplied in a root `.env` file or on the Compose command line. GitHub and authentication variables belong in `backend/.env`. Set `DOCKER_UID` and `DOCKER_GID` if the host content directory is owned by a different user.

For a real domain, set `SITE_ADDRESS=portfolio.example.com`, point DNS at the host, expose ports 80 and 443, and set `APP_AUTH_COOKIE_SECURE=true` in `backend/.env`. Caddy stores certificates in named volumes and will obtain and renew them automatically.

## Deploy on Dokploy

The repository ships a Dokploy-tuned Compose file at [`docker-compose.dokploy.yml`](../docker-compose.dokploy.yml). Compared with the local file it removes host port bindings (Dokploy's reverse proxy routes traffic), makes Caddy listen on an internal port, and replaces the local content bind mount with a persistent named volume so Studio edits survive redeploys. Use the root [`.env.example`](../.env.example) as a checklist for the Dokploy Environment tab.

1. Push the repository to GitHub (it is already public at `NachoOsella/portfolio`).
2. In Dokploy, create a **Docker Compose** service (not Docker Stack) inside your project.
3. Set the Git source: repository `NachoOsella/portfolio`, branch `main`, Compose path `./docker-compose.dokploy.yml`.
4. In the **Environment** tab add:
   - `APP_CORS_ALLOWED_ORIGIN=https://your-domain.example.com`
   - `APP_AUTH_USERS='ignacio@example.com|$2a$12$your-bcrypt-hash|Ignacio Osella'` — this is required; the deployment stops with a clear error if it is missing. Dollar signs pass through unchanged. Generate a hash with `docker run --rm httpd:2.4-alpine htpasswd -bnBC 12 "" 'a-strong-password' | tr -d ':\n'` (Spring accepts `$2y` hashes too).
   - `APP_AUTH_COOKIE_SECURE=true` (already the default in this file)
   - Optional GitHub backup: `GITHUB_TOKEN` (fine-grained PAT with Contents read/write on the repository). The other `GITHUB_*` variables already default to this repository.
5. In the **Domains** tab add your domain: select service `web`, container port `8080`, HTTPS on (Let's Encrypt), and point a DNS `A` record at the Dokploy server. Open inbound ports 80 and 443.
6. Deploy. The backend healthcheck gates the web container; once healthy, Caddy serves the site and proxies `/api` to the backend.

Notes:

- On its first creation, the `content` volume is seeded from the repository's `frontend/content` directory. After that, Studio edits survive image rebuilds and redeploys; Docker does not overwrite an existing volume. Use the Studio GitHub backup action to publish later content changes.
- Content written through `/admin` lives in the `content` volume (prefixed with the app name) and is covered by Dokploy's volume backup feature. The GitHub repository remains the durable source of truth for Markdown.
- The local `docker-compose.yml` still bind-mounts `frontend/content`, while its backend image also receives the same first-run seed for parity with production.

## Useful commands

```bash
docker compose config
docker compose logs -f backend
docker compose logs -f web
docker compose down
```

## Content backup strategy

The content is Markdown, and the repository is its source of truth:

1. **GitHub is the durable backup.** Studio pushes (`/admin/git`) commit every content change to the `NachoOsella/portfolio` repository. A push performed through the Studio is an off-site, versioned copy of the content volume.
2. **The named volume is the working copy.** In Dokploy, `content` is a persistent volume. Enable Dokploy's volume backup (scheduled archive to object storage) as an extra safety net — the Studio only writes to disk on explicit saves, so archives between pushes capture un-pushed drafts.
3. **One-liner manual backup** (from any machine with Docker):

```bash
docker run --rm -v portfolio_content:/content -v "$PWD":/backup alpine \
  sh -c 'tar czf /backup/content-$(date +%F).tgz /content'
```

4. **Disaster recovery:** create the service again (the image re-seeds `frontend/content` on a fresh volume), or restore a Dokploy volume backup / copy the tarball into the volume.

No database exists, so there is nothing else to back up: sessions are ephemeral in memory and reset on restart by design.
