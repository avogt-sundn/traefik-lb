#!/bin/sh

# Variables for certificate details
ROOT_CN="My Root CA"
SERVER_CN="server.my.localhost"

# Create directory for certificates
CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

# Generate a self-signed root certificate
openssl genrsa -out "${CERT_DIR}/rootCA.key" 2048
openssl req -x509 -new -nodes -key "${CERT_DIR}/rootCA.key" -sha256 -days 3650 -out "${CERT_DIR}/rootCA.pem" -subj "/CN=${ROOT_CN}"

# Generate a private key for the server certificate
openssl genrsa -out "${CERT_DIR}/server.key" 2048

# Create a configuration file for the server certificate signing request (CSR)
cat <<EOF > ${CERT_DIR}/server.csr.cnf
[ req ]
default_bits       = 2048
prompt             = no
distinguished_name = dn

[ dn ]
CN                  = ${SERVER_CN}

[ v3_req ]
subjectAltName     = @alt_names

[ alt_names ]
DNS.1              = ${SERVER_CN}
EOF

# Generate the CSR for the server certificate
openssl req -new -key "${CERT_DIR}/server.key" -out "${CERT_DIR}/server.csr" -config ${CERT_DIR}/server.csr.cnf

# Sign the CSR with the root CA to create the server certificate
openssl x509 -req -in "${CERT_DIR}/server.csr" -CA "${CERT_DIR}/rootCA.pem" -CAkey "${CERT_DIR}/rootCA.key" -CAcreateserial -out "${CERT_DIR}/server.crt" -days 365 -sha256 -extfile ${CERT_DIR}/server.csr.cnf -extensions v3_req

echo "Generated TLS certificate chain:"
echo "- Root CA: ${CERT_DIR}/rootCA.pem"
echo "- Server Certificate: ${CERT_DIR}/server.crt"
echo "- Server Key: ${CERT_DIR}/server.key"

# You can now use these certificates in Traefik or other TLS servers

# Variables
CERT_DIR="./certs"
KEY_FILE="server.key"
CSR_FILE="server.csr"
CRT_FILE="server.crt"
DAYS_VALID=365
