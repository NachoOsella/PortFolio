# Docker deployment

The root [`docker-compose.yml`](../docker-compose.yml) starts the Spring Boot API and a Caddy container that serves the built React application and proxies `/api` to the backend.

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
# Edit backend/.env with a GitHub token and bcrypt user hash.
docker compose up --build
```

Open `http://localhost`. The backend is not published directly; Caddy is the only public container port.

`backend/.env` is intentionally ignored by Git. It contains `GITHUB_TOKEN` and `APP_AUTH_USERS` and must never be committed.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `WEB_PORT` | `80` | Host HTTP port exposed by Caddy |
| `WEB_HTTPS_PORT` | `443` | Host HTTPS port exposed by Caddy |
| `SITE_ADDRESS` | `:80` | Caddy site address; set to a domain to enable automatic HTTPS |
| `APP_CORS_ALLOWED_ORIGIN` | `http://localhost` | Origin accepted by the API |

`WEB_PORT`, `SITE_ADDRESS`, and `APP_CORS_ALLOWED_ORIGIN` can be supplied in a root `.env` file or on the Compose command line. GitHub and authentication variables belong in `backend/.env`.

For a real domain, set `SITE_ADDRESS=portfolio.example.com`, point DNS at the host, expose ports 80 and 443, and set `APP_AUTH_COOKIE_SECURE=true` in `backend/.env`. Caddy stores certificates in named volumes and will obtain and renew them automatically.

## Useful commands

```bash
docker compose config
docker compose logs -f backend
docker compose logs -f web
docker compose down
```
