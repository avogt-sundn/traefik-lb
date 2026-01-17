# Traefik Load-Balancer (traefik-lb)

Concise guide to the repository: layout, how to run the stack, and where to find implementation details.

**Project Summary**
- **Purpose:** Local/dev load-balancer and orchestration setup using Traefik for a monorepo with Java backend services and an Angular frontend.
- **Scope:** `backend`, `frontend`, `traefik`, and supporting `infrastructure` and `documentation` resources.

**Repository Layout**
- **backend**: [backend](backend/) — two Java microservices (`java-one` and `java-two`) each with a `Dockerfile`, `docker-compose.yaml` and Maven `pom.xml`.
- **frontend**: [frontend](frontend/) — Angular workspace with several projects (ekf, loans, partner, shell, shared). Contains `Dockerfile` and `docker-compose.yaml` at the root of `frontend` for containerized builds and multiple `projects/*` for app code.
- **traefik**: [traefik](traefik/) — Traefik configuration, `docker-compose.yaml`, `traefik_conf.yml`, certificate tooling (`generate-selfsigned-cert.sh`) and a `certs/` folder.
- **infrastructure/forward-devcontainer**: [infrastructure/forward-devcontainer](infrastructure/forward-devcontainer/) — development container and helper scripts used for local dev environments.
- **documentation**: [documentation](documentation/) — design and setup docs (e.g., `ARCHITECTURE.md`, `SETUP.md`, `DEVELOPING.md`).

**Quick Start (local, minimal)**
1. From repository root, build and start containers (Traefik and services):

```bash
# build and start services defined in root docker-compose
docker compose up --build -d

# to stop
docker compose down
```

2. Frontend dev server (optional, per app):

```bash
cd frontend
npm install
npm run serve:partner   # or the relevant serve script for another project
```

3. Backend build (Maven):

```bash
mvn -f backend/java-one/pom.xml clean package
mvn -f backend/java-two/pom.xml clean package
```

**Traefik & TLS**
- Traefik configuration and routing lives in [traefik](traefik/). Use `generate-selfsigned-cert.sh` to create local certs for HTTPS during development. The Traefik `docker-compose.yaml` wires entrypoints, providers and mounts the `certs/` folder.

**Development notes**
- Each Java service exposes its own port and can be run via Maven or as a Docker image using the provided `Dockerfile` in `backend/*/`.
- The Angular apps live under `frontend/projects/*` — `shared` contains libraries/components used by other apps.
- The repository includes example `docker-compose.yaml` files for both the top-level orchestration and for individual services (see `backend/java-one/docker-compose.yaml`, `backend/java-two/docker-compose.yaml`, and `frontend/docker-compose.yaml`).

**Docs & Where to Look**
- Architecture and setup: [documentation/ARCHITECTURE.md](documentation/ARCHITECTURE.md)
- Developer setup: [documentation/DEVELOPING.md](documentation/DEVELOPING.md) and [documentation/SETUP.md](documentation/SETUP.md)
- Traefik specifics: [traefik/traefik_conf.yml](traefik/traefik_conf.yml) and [traefik/generate-selfsigned-cert.sh](traefik/generate-selfsigned-cert.sh)

**Troubleshooting & Tips**
- If running frontend dev servers, ensure ports do not conflict with Traefik; adjust `proxy.conf.json` / dev server ports as needed.
- Use `docker compose logs -f` and Traefik dashboard (if enabled) to inspect routes and TLS issues.

**Next steps**
- Run the stack with `docker compose up` then verify frontend and backend health endpoints.
- Review `documentation/` for operational details and scaling notes.

---
Generated summary: covers layout, start steps, and key files to inspect for deeper details.
