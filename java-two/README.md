# java-two Application


## API

app-two:8080/api/api-two/greet

### Testing with curl

```sh
curl app-two:8080/api/two/greet -H "Content-Type: text/plain" -d 'Armin'
# {"id":1,"name":"Armin","message":"Hello, Armin!"}%
````

### Building and running as container and testing

```sh
docker compose \
    -f /workspaces/traefik-lb/java-two/docker-compose.yaml \
    up -d --build
```

## Simple Spring Boot REST API

This project is a simple Spring Boot REST API application. It includes a basic structure to get started with developing RESTful services using Spring Boot.