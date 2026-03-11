# Add Compose Service

Scaffold a new service into this project's modular Docker Compose stack.

## Instructions

Ask the user for the following information (ask all at once):

1. **Service name** — e.g., `app-four` (used for container name, image name, and Traefik labels)
2. **Service type** — one of:
   - `java-spring` — Spring Boot backend (Java, Maven, HTTPS on 443, `/actuator/health`)
   - `java-quarkus` — Quarkus backend (Java, Maven, HTTPS on 443, `/q/health`)
   - `frontend-angular` — Angular micro-frontend (nginx, HTTP on 80, `/`)
   - `infrastructure` — Supporting infrastructure service (custom healthcheck)
3. **Database needed?** — Yes/No. If Yes: Postgres 15 with its own healthcheck.
4. **Path prefix** — Traefik URL path prefix (e.g., `/api/four`, `/dashboard`)
5. **Priority** — Traefik routing priority (`1000` for backends, `120` for frontend remotes, `100` for catch-all)
6. **Strip prefix?** — Yes/No (Yes for frontend remotes, No for backends)
7. **Service directory** — where to create the files (e.g., `backend/java-four`, `frontend`)

## What to Generate

### 1. `<service-dir>/docker-compose.yaml`

Follow the exact pattern from `backend/java-one/docker-compose.yaml` (for Java) or `frontend/docker-compose.yaml` (for Angular):

```yaml
networks:
  default:
    name: docker-default-network
    external: true

services:
  # Include postgres-<name> service here if database is needed
  # with healthcheck: pg_isready -U postgres

  <service-name>:
    image: <service-name>
    build:
      context: .
      dockerfile: Dockerfile
      network: host   # Required for mirror access during build
    depends_on:
      postgres-<name>:      # Only if database needed
        condition: service_healthy
    healthcheck:
      test: [...]   # Framework-appropriate health check
      interval: 10s
      timeout: 10s
      retries: 10
    labels:
      # Full Traefik label block (see add-traefik-route skill for patterns)
```

### 2. `<service-dir>/Dockerfile`

Use the appropriate multi-stage pattern with build mirror config:

**Java/Maven** (from `backend/java-one/Dockerfile`):
- Stage 1: `maven:3-eclipse-temurin-25-alpine` with `settings.xml` injected for `http://localhost:8008/central`
- `--mount=type=cache` for `~/.m2/repository`
- Stage 2: `eclipse-temurin:25-jre-alpine` with curl for healthcheck
- Entrypoint on port 443

**Angular/nginx** (from `frontend/Dockerfile`):
- Stage 1: `node:24` with `ARG AIM` parameterization, `npm set registry http://localhost:4873/`
- Stage 2: `nginx:stable` with SPA fallback `nginx.conf`

### 3. Root `docker-compose.yaml` include line

Show the exact line to add to the root `docker-compose.yaml` under `include:`:

```yaml
  - <service-dir>/docker-compose.yaml
```

## After Generating

Remind the user of the two-phase boot requirement:
```bash
make up   # ensures mirrors are healthy before app image builds
```

Or manually:
```bash
docker compose up --wait maven-mirror bootstrap-maven-mirror npm-mirror
docker compose up --build -d
```

Validate the compose config before starting:
```bash
docker compose config
```
