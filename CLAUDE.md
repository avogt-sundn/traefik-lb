# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A local/dev load-balancer demo using **Traefik** as the edge proxy in front of three Java backend services and an Angular micro-frontend. The stack is fully containerized and TLS is used on every connection — including backend-to-backend and Traefik-to-upstream.

## Starting the full stack

A pre-requisite Docker network must exist before bringing up the stack:

```bash
make up    # creates network, starts mirrors first, then builds and starts all services
make down  # docker compose down
```

Or manually in two steps (build mirrors must be healthy before app images are built):
```bash
docker network create docker-default-network
docker compose up --wait maven-mirror bootstrap-maven-mirror npm-mirror
docker compose up --build -d
docker compose down
```

The root `docker-compose.yaml` uses `include:` to compose these sub-files:
- `infrastructure/traefik/docker-compose.yaml` — Traefik gateway + standby + docker-socket-proxy
- `infrastructure/build-services/docker-compose.yaml` — Maven mirror (Reposilite, port 8008) + npm mirror (Verdaccio, port 4873)
- `infrastructure/forward-devcontainer/docker-compose.yaml` — socat forward containers for live Angular dev
- `backend/java-one/docker-compose.yaml` — app-one + postgres-one
- `backend/java-two/docker-compose.yaml` — app-two + postgres-two
- `backend/java-three/docker-compose.yaml` — app-three (JVM) + app-three-native (GraalVM) + postgres-three
- `frontend/docker-compose.yaml` — shell, ekf, loans, partner nginx containers
- `loadbalancing/docker-compose.yaml` — whoami replicas + load-balancing smoke test
- `tests/docker-compose.yaml` — e2e test container (waits for all services to be healthy)

## Build commands

### Java backends (Maven)
```bash
# Build a single backend locally
mvn -f backend/java-one/pom.xml clean package -DskipTests
mvn -f backend/java-two/pom.xml clean package -DskipTests
mvn -f backend/java-three/pom.xml clean package -DskipTests

# Run a single test class
mvn -f backend/java-one/pom.xml -pl . -Dtest=HelloControllerTest test
```

Docker builds use `./mvnw` (Maven wrapper) and inject a `~/.m2/settings.xml` that routes Maven Central through the local Reposilite mirror at `http://localhost:8008/central`. The build network is set to `host` so the container can reach the mirror running on the host.

### Angular frontend
```bash
cd frontend
npm install
npm run serve:all          # all four apps concurrently (ports 4200-4203)
npm run serve:partner      # single app
npm run build:all          # production build
npm run lint               # ESLint
npm run lint:fix
npm run test               # Karma, no-watch
```

## Architecture

### Routing and TLS

- Traefik listens on `:80` (redirects to HTTPS) and `:443`.
- The Traefik dashboard is exposed on port `8888` (mapped from container port 8080).
- A `standby` Traefik instance runs in parallel (ports 81/444/8889) for HA testing.
- Docker socket is never mounted directly; Traefik talks to a **docker-socket-proxy** (`tecnativa/docker-socket-proxy`) over `tcp://dockerd-proxy:2375`.
- All backend containers serve HTTPS on port 443 with self-signed certs; Traefik uses `insecureSkipVerify: true` for upstream TLS.
- TLS cert/key for Traefik itself: `infrastructure/traefik/certs/server-chain.crt` / `server.key`. Regenerate with `infrastructure/traefik/generate-selfsigned-cert.sh`.

### Service discovery

Traefik routes are declared as Docker labels on each service. Key pattern:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<name>.rule=PathPrefix(`/api/one`)"
  - "traefik.http.routers.<name>.entrypoints=web,websecure"
  - "traefik.http.services.<name>.loadbalancer.server.port=443"
  - "traefik.http.services.<name>.loadbalancer.server.scheme=https"
  - "traefik.http.routers.<name>.priority=1000"
```

### Backend services

| Service | Framework | Path prefix | Health endpoint |
|---|---|---|---|
| app-one | Spring Boot (Java 25) | `/api/one` | `/actuator/health` |
| app-two | Spring Boot (Java 25) | `/api/two` | `/actuator/health` |
| app-three | Quarkus (Java 21) | `/api/three` | `/q/health` |
| app-three-native | Quarkus Native | `/api/three` | `/q/health` |

**app-one** does not implement its own data storage — its `ForwardingGreetingService` proxies calls for `/api/one/greet` and `/api/one/greetings` through Traefik (`https://gateway`) to `app-two` at `/api/two/...`. This means app-one depends on app-two being reachable via the gateway.

Each backend connects to its own Postgres 15 instance (`postgres-one/two/three`) with username/password `postgres/postgres`.

### Frontend (Angular Micro-Frontend / Native Federation)

Four Angular apps share one `frontend/` workspace:
- **shell** — host app, served at `/` (priority 100)
- **partner**, **ekf**, **loans** — remotes, served at `/partner`, `/ekf`, `/loans` (priority 120, prefix stripped by Traefik middleware)

For live development, **forward containers** (`infrastructure/forward-devcontainer/`) proxy the devserver ports (4200–4203) into the Docker network with higher Traefik priority (1000–1999), so live traffic overrides the packaged containers automatically. The forward container healthcheck makes it drop out of rotation when the devserver is not running.

### Build mirrors

Both mirrors run as Docker services and are required for Docker image builds:
- **Maven mirror**: Reposilite at `http://localhost:8008` — caches Maven Central
- **npm mirror**: Verdaccio at `http://localhost:4873` — caches npm registry

Docker builds use `--network host` so the build stage can reach these mirrors.

## Traefik configuration

Static config: `infrastructure/traefik/traefik_conf.yml`
Dynamic config: Docker labels + same file via `providers.file`
Access log: written to `/logs/access.log` inside the container
