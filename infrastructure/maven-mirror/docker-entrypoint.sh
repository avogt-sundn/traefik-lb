#!/bin/sh
set -e

if [ ! -f /app/data/configuration.cdn ]; then
  echo "Injecting initial reposilite.cdn into volume..."
  cp /reposilite.cdn /app/data/configuration.cdn
else
  echo "configuration.cdn already exists in volume."
  echo "OVERWRITING..."
  cp /reposilite.cdn /app/data/configuration.cdn

fi

cat /app/data/configuration.cdn

exec /app/entrypoint.sh "$@"