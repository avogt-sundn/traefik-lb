# Add Traefik Route

Generate a complete Traefik Docker labels block for a new service in this project.

## Instructions

Ask the user for the following information (you can ask all at once):

1. **Service name** — used as the router/service identifier in all label keys (e.g., `app-four`)
2. **Path prefix** — the URL path Traefik should match (e.g., `/api/four`)
3. **Upstream port** — the port the container listens on (e.g., `443` for Java backends, `80` for nginx)
4. **Upstream scheme** — `https` for Java/Quarkus backends, `http` (omit scheme label) for nginx frontends
5. **Health endpoint** — the path Traefik should use for load balancer health checks (e.g., `/actuator/health`, `/q/health`, `/`)
6. **Priority** — routing priority number (use `1000` for backend services, `120` for frontend remotes, `100` for shell/catch-all)
7. **Strip prefix?** — Yes/No: should the path prefix be stripped before forwarding? (Yes for frontend remotes, No for backends)

## Output

Generate a complete, ready-to-paste `labels:` block following the project conventions from `backend/java-one/docker-compose.yaml` and `frontend/docker-compose.yaml`.

### For a backend service (HTTPS, no strip):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<name>.rule=PathPrefix(`<prefix>`)"
  - "traefik.http.routers.<name>.entrypoints=web,websecure"
  - "traefik.http.services.<name>.loadbalancer.server.port=<port>"
  - "traefik.http.services.<name>.loadbalancer.server.scheme=https"
  - "traefik.http.services.<name>.loadbalancer.sticky.cookie=false"
  - "traefik.http.services.<name>.loadbalancer.healthcheck.path=<health-path>"
  - "traefik.http.services.<name>.loadbalancer.healthcheck.port=<port>"
  - "traefik.http.routers.<name>.priority=<priority>"
```

### For a frontend remote (HTTP, strip prefix):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<name>.rule=PathPrefix(`<prefix>`)"
  - "traefik.http.middlewares.<name>-strip.stripprefix.prefixes=<prefix>"
  - "traefik.http.routers.<name>.middlewares=<name>-strip@docker"
  - "traefik.http.routers.<name>.entrypoints=web,websecure"
  - "traefik.http.services.<name>.loadbalancer.server.port=<port>"
  - "traefik.http.services.<name>.loadbalancer.healthcheck.path=/"
  - "traefik.http.services.<name>.loadbalancer.healthcheck.port=<port>"
  - "traefik.http.routers.<name>.priority=<priority>"
```

After generating the labels, remind the user:
- The service must be on `docker-default-network` (or whichever network Traefik monitors)
- If the service uses HTTPS with a self-signed cert, `insecureSkipVerify: true` is already set globally in `traefik_conf.yml` — no additional config needed
- For dev server override, create a corresponding forward container in `infrastructure/forward-devcontainer/docker-compose.yaml` with priority set to (production priority + 100)
