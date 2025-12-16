# Additional options

## TLS on upstream connections

The connections bz which traefik connects to the backend containers in order to load balance traffic are called upstreams.

```yaml
# Use HTTPS for upstream
    - "traefik.http.services.web.loadbalancer.server.port=443"
    - "traefik.http.services.web.loadbalancer.server.scheme=https"
```

the backend has to open a socket 443 and be ready to receive tls handshake before work on the requests can commence

- add the certificate file `selfsigned.crt` to the truststore

