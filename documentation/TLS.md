# TLS/SSL Configuration Guide

This document describes the TLS/SSL setup for the Traefik Load Balancer and backend services in this project.

## Overview

The project uses self-signed certificates to secure communications at multiple layers:
- **Frontend**: Client → Traefik (HTTPS on port 443)
- **Backend**: Traefik → Java Services (HTTPS)
- **Java Services**: Expose HTTPS endpoints with embedded certificates

## Certificate Structure

### Root CA
- **File**: `infrastructure/traefik/certs/rootCA.pem`
- **File**: `infrastructure/traefik/certs/rootCA.key`
- **Purpose**: Issues the server certificate
- **Validity**: 10 years (3650 days)

### Server Certificate
- **Certificate**: `infrastructure/traefik/certs/server.crt`
- **Key**: `infrastructure/traefik/certs/server.key`
- **Common Name (CN)**: `server.my.localhost`
- **Validity**: 1 year (365 days)
- **Usage**: Traefik gateway and backend services

## Generating Certificates

### Initial Certificate Generation

The certificates are automatically generated when building the Traefik image:

```bash
cd infrastructure/traefik
docker compose build --no-cache
```

This runs the `generate-selfsigned-cert.sh` script which:
1. Checks if root CA files exist (if yes, skips CA generation)
2. Generates a new server certificate signed by the CA

### Manual Certificate Regeneration

To manually regenerate the certificates:

```bash
cd infrastructure/traefik
./generate-selfsigned-cert.sh
```

**Note**: The script skips root CA generation if it already exists. To regenerate everything:

```bash
rm certs/rootCA.* certs/rootCA.srl
./generate-selfsigned-cert.sh
```

## Traefik Configuration

### traefik_conf.yml

The Traefik configuration file specifies the TLS setup:

```yaml
tls:
  stores:
    default:
      defaultCertificate:
        certFile: /etc/traefik/certs/server.crt
        keyFile: /etc/traefik/certs/server.key
```

### Docker Compose Configuration

The Dockerfile copies certificates into the Traefik image:

```dockerfile
COPY certs/server.crt /etc/traefik/certs/server.crt
COPY certs/server.key /etc/traefik/certs/server.key
```

## Backend Services (Java)

### Using HTTPS with Java Services

Java backend services (whoami, Spring Boot apps) can be configured to use HTTPS with the same certificates.

#### Converting PEM to Java Keystore

Use the provided keystore generation script:

```bash
cd infrastructure/traefik
./generate-keystore.sh
```

This creates:
- `certs/keystore.p12` (PKCS12 format - recommended for Spring Boot 3+)
- `certs/keystore.jks` (JKS format - for older Java versions)

#### Spring Boot Configuration

Add to `application.properties`:

```properties
# Enable HTTPS
server.ssl.enabled=true
server.ssl.key-store=classpath:certs/keystore.p12
server.ssl.key-store-password=changeit
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
server.port=8443

# Optional: Redirect HTTP to HTTPS
server.http2.enabled=true
```

#### Custom Keystore Password

Set a custom password before generating:

```bash
export KEYSTORE_PASSWORD=my-secret-password
./generate-keystore.sh
```

Then use the same password in `application.properties`.

### WhoAmi Backend Example

The `loadbalancing/Dockerfile.whoami` demonstrates embedding certificates in a container:

```dockerfile
FROM traefik/whoami:latest

# Copy the self-signed certificates
COPY infrastructure/traefik/certs/server.crt /certs/server.crt
COPY infrastructure/traefik/certs/server.key /certs/server.key

EXPOSE 8443
```

The Docker Compose labels configure Traefik to use HTTPS:

```yaml
labels:
  - "traefik.http.services.web.loadbalancer.server.port=8443"
  - "traefik.http.services.web.loadbalancer.server.scheme=https"
```

## Traefik Backend TLS Configuration

### Backend Certificate Verification

The Traefik configuration allows self-signed certificates on backend services:

```yaml
serversTransport:
  insecureSkipVerify: true
```

This disables certificate verification for backend connections, allowing:
- Self-signed certificates to be used
- Development/testing environments to work without trust setup

**⚠️ Note**: For production, configure proper certificate validation.

## Testing TLS Connections

### Test Frontend TLS (Client → Traefik)

Extract and verify the frontend certificate:

```bash
openssl s_client -connect localhost:443 -showcerts
```

### Test Certificate Fingerprint

Compare local certificate with served certificate:

```bash
cd infrastructure/traefik
./verify-cert.sh
```

### Test Backend Connection

View Traefik logs to see backend TLS connections:

```bash
docker compose -f infrastructure/traefik/docker-compose.yaml logs -f gateway
```

Look for messages like:
```
backend_scheme=https
```

## Certificate Files Location

```
infrastructure/traefik/certs/
├── rootCA.key              # Root CA private key
├── rootCA.pem              # Root CA certificate
├── rootCA.srl              # Serial number file
├── server.crt              # Server certificate
├── server.key              # Server private key
├── server.csr              # Certificate signing request
├── server.csr.cnf          # CSR configuration
├── keystore.p12            # Java PKCS12 keystore (generated)
└── keystore.jks            # Java JKS keystore (generated)
```

## Troubleshooting

### Certificate Not Loaded

If Traefik is not using the certificate:

1. Verify certificate files are in the container:
   ```bash
   docker exec traefik-gateway-1 ls -la /etc/traefik/certs/
   ```

2. Check Traefik logs:
   ```bash
   docker compose -f infrastructure/traefik/docker-compose.yaml logs gateway
   ```

3. Verify traefik_conf.yml is loaded:
   ```bash
   docker exec traefik-gateway-1 cat /etc/traefik/traefik.yml
   ```

### Java Keystore Issues

If Java service fails to load keystore:

1. Verify keystore file exists:
   ```bash
   keytool -list -v -keystore certs/keystore.p12 -storetype PKCS12 -storepass changeit
   ```

2. Check application logs for certificate errors

3. Regenerate keystore:
   ```bash
   rm certs/keystore.p12
   ./generate-keystore.sh
   ```

## Security Considerations

- **Development Only**: These are self-signed certificates for development/testing
- **Production Deployment**:
  - Use certificates from a trusted CA (Let's Encrypt, etc.)
  - Implement proper certificate rotation
  - Use certificate-based service authentication
  - Enable certificate pinning where appropriate

## References

- [Traefik TLS Documentation](https://doc.traefik.io/traefik/https/tls/)
- [Spring Boot SSL Configuration](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Java Keystore Documentation](https://docs.oracle.com/en/java/javase/21/docs/specs/security/standard-names.html)
