# See here for image contents: https://github.com/microsoft/vscode-dev-containers/blob/main/containers/java/.devcontainer/base.Dockerfile
# [Choice] Java version (use -bullseye variants on local arm64/Apple Silicon): 8, 11, 17, 8-bullseye, 11-bullseye, 17-bullseye, 8-buster, 11-buster, 17-buster
FROM mcr.microsoft.com/devcontainers/java:1-bullseye

# Avoid warnings by switching to noninteractive
# ENV DEBIAN_FRONTEND=noninteractive

ENV IGNORE_NOTICE=true

# BEGIN ------ install common utils: ping, dig, ncat, pip, yq
RUN apt-get update && apt-get install -y iputils-ping dnsutils file apache2-utils python3-pip httpie telnet \
    && pip install yq
#   END ------ install common utils: ping, dig, ncat, pip, yq

# BEGIN plantuml extension
RUN apt-get update && apt-get install -y graphviz
# END   plantuml extension


LABEL traefik.enable="true" \
    traefik.http.services.vscode-service.loadbalancer.server.port="8080" \
    traefik.http.routers.vscode-service.rule="Host(`vscode.localhost.direct`)" \
    traefik.http.routers.vscode-service.entrypoints="websecure" \
    traefik.http.routers.vscode-service.middlewares="cors" \
    traefik.http.middlewares.cors.headers.accessControlAllowOriginList=* \
    traefik.http.middlewares.cors.headers.accessControlAllowHeaders=content-type
