# How to develop code

## Angular Frontends

1. Run a devcontainer
1. Devcontainer hostname must match the name from [](../infrastructure/docker-compose.yaml):

    ```yaml
    forward-shell:
    environment:
        - LISTEN_PORT=4200
        - TARGET_HOST=traefik-lb
    ```
1. Start ng serve Live editing mode:

    ```sh
    npm run serve:shell

    > CoreFinance@0.0.0 serve:shell
    > ng serve shell --port 4200

    INFO  Building federation artefacts
    Initial chunk files | Names         |  Raw size
    styles.css          | styles        |  13.62 kB |
    main.js             | main          | 235 bytes |
    polyfills.js        | polyfills     | 103 bytes |

                        | Initial total |  13.96 kB

    Lazy chunk files    | Names         |  Raw size
    chunk-RACVQCOT.js   | bootstrap     | 118.90 kB |

    Application bundle generation complete. [1.081 seconds] - 2026-01-16T12:38:48.631Z

    Watch mode enabled. Watching for file changes...
    NOTE: Raw file sizes do not reflect development server per-request transformations.
    ➜  Local:   http://localhost:4200/
    ➜  Network: http://172.18.0.2:4200/
    ➜  press h + enter to show help
    ```

    - make sure `Network: ` line is present which confirms that ng serve is listening on localhost and also on the docker network

1. stop the container for the shell

    ```sh
    cd /workspaces/traefik-lb
    docker compose down shell
    ```



