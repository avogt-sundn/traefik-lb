# How to develop code


## Angular Frontends

Steps to do when you want to work on the frontend code.

1. Run all containers: `docker compose up -d` on the top level project folder
1. Run your IDE with a devcontainer and use the terminal from there: `npm run serve:all`. (or `npm run serve:partner` to run only a specific remote project).


```sh
cd /workspaces/traefik-lb
docker compose up -d
cd frontend
npm i
npm run serve:all
```


### How it works

Static-build code containers run together with some forward containers that connect into the devcontainer. Both declare equal routes to the Traefik but differ in priority: forwards win over static-builds.

Result: as soon as you start devserver, it will receive requests and allow you to make changes live.


```mermaid
graph TD

```

- Angular code gets build into Docker images by compiling the TypeScript and assets into static files [./frontend/Dockerfile](../frontend/Dockerfile)


Traefik routes are prioritized:
- Angular packaged code is served from nginx containers which get priority 100-199
- forward containers get higher priority (1000-1999)
  - by default http requests are sent the packaged code containers

- healthcheck on the forward container makes it become out-of-service automatically as soon as devserver is stopped and as long as devserver is not running.
- other configuration refers to the pathprefix this remote should be served on
   - `shell` servers on `/`, the root contextpath
   - `partner` serves the remote from the [./frontend/projects/partner/](../frontend/projects/partner/src/index.html)
   - `ekf` serves the remote from the [./frontend/projects/ekf/](../frontend/projects/ekf/src/index.html)
   - `loans` serves the remote from the [./frontend/projects/partner/](../frontend/projects/loans/src/index.html)
- port 4200 is the target port where devserver is listening in the devcontainer is set in the [frontend/angular.json](../frontend/angular.json)'s `serve-original`block


    ```yaml
    forward-shell:
      image: forward:latest

    labels:
      # the name of this instance is: forward-shell
      - "traefik.enable=true"
      - "traefik.http.routers.forward-shell.rule=PathPrefix(`/`)"
      - "traefik.http.routers.forward-shell.entrypoints=web"
      - "traefik.http.services.forward-shell.loadbalancer.server.port=4200"
      - "traefik.http.services.forward-shell.loadbalancer.healthcheck.path=/"
      - "traefik.http.services.forward-shell.loadbalancer.healthcheck.port=4200"
      - "traefik.http.routers.forward-shell.priority=1000"
    ```
---
### Troubleshootings

Live editing of code won't work?

Check that traefik is actually routing to the devserver.

1. observe forward container is trying to connect but fails

    ```sh
    cd /workspaces/traefik-lb
    docker compose logs -f forward-partner
    # forward-partner-1  | 2026/01/17 12:27:44 socat[12347] E connect(5, AF=2 172.18.0.5:4202, 16): Connection refused
    # (more lines of the same)

    # start devserver
    ```


1. stop the container for the shell

    ```sh
    cd /workspaces/traefik-lb
    docker compose down shell
    ```
