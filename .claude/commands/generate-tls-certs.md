# Generate TLS Certs

Generate a self-signed TLS PKI setup for local development, following the patterns in `infrastructure/traefik/`.

## Instructions

Ask the user for the following information (ask all at once):

1. **Hostnames / SANs** — comma-separated list of DNS names to include in the certificate SANs (e.g., `gateway, localhost, myservice.local`). `localhost` and `127.0.0.1` are always included automatically.
2. **Primary CN** — the Common Name for the server certificate (typically the primary hostname, e.g., `gateway`)
3. **Output directory** — where to place the generated script and certs (e.g., `infrastructure/traefik/`, `backend/java-four/certs/`)
4. **Java keystores needed?** — Yes/No. If Yes, also generate a `generate-keystore.sh` script.
5. **Framework** (only if Java keystores needed) — `spring-boot` or `quarkus`

## What to Generate

### 1. `generate-selfsigned-cert.sh`

Based on `infrastructure/traefik/generate-selfsigned-cert.sh`. Key characteristics:
- Idempotent: checks if Root CA already exists before regenerating it
- Root CA validity: 3650 days
- Server cert validity: 365 days
- SANs include all user-provided hostnames + `localhost` + `127.0.0.1`
- Output: `rootCA.key`, `rootCA.pem`, `server.key`, `server.crt`, `server-chain.crt`
- Chain cert = `server.crt` + `rootCA.pem` concatenated

```bash
#!/bin/sh
ROOT_CN="My Root CA"
SERVER_CN="<primary-cn>"
CERT_DIR="<output-dir>/certs"
mkdir -p "$CERT_DIR"

# Root CA (idempotent)
if [ -f "${CERT_DIR}/rootCA.key" ] && [ -f "${CERT_DIR}/rootCA.pem" ]; then
  echo "Root CA already exists, skipping..."
else
  openssl genrsa -out "${CERT_DIR}/rootCA.key" 2048
  openssl req -x509 -new -nodes -key "${CERT_DIR}/rootCA.key" -sha256 -days 3650 \
    -out "${CERT_DIR}/rootCA.pem" -subj "/CN=${ROOT_CN}"
fi

# Server key + CSR config with SANs
openssl genrsa -out "${CERT_DIR}/server.key" 2048
cat <<EOF > ${CERT_DIR}/server.csr.cnf
[ req ]
default_bits = 2048
prompt = no
distinguished_name = dn
[ dn ]
CN = ${SERVER_CN}
[ v3_req ]
subjectAltName = @alt_names
[ alt_names ]
DNS.1 = ${SERVER_CN}
DNS.2 = localhost
# ... additional DNS entries
IP.1  = 127.0.0.1
EOF

# Sign
openssl req -new -key "${CERT_DIR}/server.key" -out "${CERT_DIR}/server.csr" \
  -config ${CERT_DIR}/server.csr.cnf
openssl x509 -req -in "${CERT_DIR}/server.csr" \
  -CA "${CERT_DIR}/rootCA.pem" -CAkey "${CERT_DIR}/rootCA.key" -CAcreateserial \
  -out "${CERT_DIR}/server.crt" -days 365 -sha256 \
  -extfile ${CERT_DIR}/server.csr.cnf -extensions v3_req

# Chain cert
cat "${CERT_DIR}/server.crt" "${CERT_DIR}/rootCA.pem" > "${CERT_DIR}/server-chain.crt"
```

### 2. `generate-keystore.sh` (if Java keystores requested)

Based on `infrastructure/traefik/generate-keystore.sh`. Generates both keystore and truststore as PKCS12.

### 3. Traefik TLS config snippet

```yaml
serversTransport:
  insecureSkipVerify: true

tls:
  stores:
    default:
      defaultCertificate:
        certFile: /etc/traefik/certs/server-chain.crt
        keyFile: /etc/traefik/certs/server.key
```

### 4. Framework config snippet (if Java keystores requested)

**Spring Boot** (`application.properties`):
```properties
server.ssl.key-store=classpath:certs/keystore.p12
server.ssl.key-store-password=changeit
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
server.port=443
```

**Quarkus** (`application.properties`):
```properties
quarkus.http.ssl.certificate.key-store-file=certs/keystore.p12
quarkus.http.ssl.certificate.key-store-password=changeit
quarkus.http.ssl-port=443
quarkus.http.insecure-requests=redirect
```

## After Generating

Remind the user to:
1. Make the script executable: `chmod +x generate-selfsigned-cert.sh`
2. Run it: `./generate-selfsigned-cert.sh`
3. If Java keystores needed, also run: `./generate-keystore.sh`
4. Mount the `certs/` directory into the Docker container
5. Add `certs/*.key` and `certs/*.p12` to `.gitignore` (private keys must not be committed)
