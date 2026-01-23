#!/bin/bash

# Verify that Traefik is serving the self-signed certificate

set -e

CERT_PATH="/workspaces/traefik-lb/infrastructure/traefik/certs/server.crt"
TEMP_DIR="/tmp/traefik-cert-check-$$"
mkdir -p "$TEMP_DIR"

trap "rm -rf $TEMP_DIR" EXIT

echo "📋 Testing Traefik TLS certificate..."
echo ""

# Extract the server certificate
echo "1️⃣  Extracting server certificate from gateway:443..."
openssl s_client -connect gateway:443 -showcerts </dev/null | openssl x509 -outform PEM > "$TEMP_DIR/server.crt"

if [ ! -f "$TEMP_DIR/server.crt" ]; then
  echo "❌ Failed to extract server certificate"
  exit 1
fi

# Get fingerprints
SERVER_FP=$(openssl x509 -in "$TEMP_DIR/server.crt" -fingerprint -noout | cut -d= -f2)
LOCAL_FP=$(openssl x509 -in "$CERT_PATH" -fingerprint -noout | cut -d= -f2)

echo ""
echo "2️⃣  Comparing fingerprints..."
echo "   Local cert:  $LOCAL_FP"
echo "   Server cert: $SERVER_FP"
echo ""

if [ "$SERVER_FP" = "$LOCAL_FP" ]; then
  echo "✅ SUCCESS: Traefik is serving the correct self-signed certificate!"
  exit 0
else
  echo "❌ FAILURE: Certificates do NOT match!"
  echo ""
  echo "📊 Detailed comparison:"
  echo "   Local:  $(openssl x509 -in "$CERT_PATH" -noout -subject -dates)"
  echo "   Server: $(openssl x509 -in "$TEMP_DIR/server.crt" -noout -subject -dates)"
  exit 1
fi
