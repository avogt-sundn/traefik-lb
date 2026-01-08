# How to test with port forwarding to Devcontainer

```bash
cd /workspaces/traefik-lb/
docker compose run forward
# Forwarding 0.0.0.0:80 -> traefik-lb:8080
```

Run from ide or command line with maven

```bash
mvn test -Dtest=HelloContainerTest
```
The test code boots a Spring container and runs the test code calling the app-one rest endpoint in-process.
- Test class -  [HelloContainerTest.java](./java-two/src/test/java/com/example/simplerestapi/controller/HelloControllerTest.java)

- [HelloController.java](./java-one/src/main/java/com/example/simplerestapi/controller/HelloController.java) calls the second service - java-two - via http.

- http url is configured statically in [ForwardingGreetingService.java](./java-one/src/main/java/com/example/simplerestapi/service/ForwardingGreetingService.java) to call http://gateway/api/two/greet

- Traefik container is responding to the request on that endpoint, deployed to hostname `gateway` in [docker-compose.yaml](./docker-compose.yaml)

  - ![](forward-service.png)

- forward container is configured to send any received request to the designated host `traefik-lb` and port `8080`:

    ```yaml
    forward:
        profiles:
        - runForward
        image: forward:latest
        build:
        context: tcp-forwarder
        labels:
        - "traefik.enable=true"
        - "traefik.http.routers.forward-two.rule=PathPrefix(`/api/two`)"
        - "traefik.http.routers.forward-two.entrypoints=web"
        - "traefik.http.services.forward-two.loadbalancer.server.port=80"
        - "traefik.http.services.forward-two.loadbalancer.sticky.cookie=false"
        environment:
        - TARGET_HOST=traefik-lb
        - TARGET_PORT=8080
    ```



- traefik-lb is the hostname for the devcontainer as declared in the [](./.devcontainer/devcontainer.json)

    ```
    "runArgs": [
        "--network=docker-default-network",
        // change this once you rename the project folder!
        "--hostname=${localWorkspaceFolderBasename}"
    ],

    ```
