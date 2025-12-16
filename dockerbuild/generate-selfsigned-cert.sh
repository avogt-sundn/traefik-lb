#!/bin/bash

# Variables
CERT_DIR="./certs"
KEY_FILE="selfsigned.key"
CSR_FILE="selfsigned.csr"
CRT_FILE="selfsigned.crt"
DAYS_VALID=365

# Create directory for certificates
mkdir -p "$CERT_DIR"

# Generate Private Key
echo "Generating private key..."
openssl genrsa -out "$CERT_DIR/$KEY_FILE" 2048

# Generate CSR
echo "Generating Certificate Signing Request (CSR)..."
openssl req -new -key "$CERT_DIR/$KEY_FILE" -out "$CERT_DIR/$CSR_FILE" -subj "/C=DE/ST=Berlin/L=Berlin/O=Organization/OU=Unit/CN=*.localhost.direct"

# Generate Self-Signed Certificate
echo "Generating self-signed certificate..."
openssl x509 -req -days $DAYS_VALID -in "$CERT_DIR/$CSR_FILE" -signkey "$CERT_DIR/$KEY_FILE" -out "$CERT_DIR/$CRT_FILE"

# Output
echo "Self-signed certificate generated:"
echo "Private Key: $CERT_DIR/$KEY_FILE"
echo "Certificate: $CERT_DIR/$CRT_FILE"