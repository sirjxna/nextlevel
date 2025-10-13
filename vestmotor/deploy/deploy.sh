#!/usr/bin/env bash
set -euo pipefail
HOST="$1"            # e.g. root@72.61.157.152
DEST_DIR="/var/www/vestmotor"
PORT="${PORT:-22}"

if [ -z "${HOST}" ]; then
  echo "Usage: ./deploy.sh root@IP [PORT]"; exit 1; fi
if [ -n "${2:-}" ]; then PORT="$2"; fi

# Create destination and sync files
ssh -p "$PORT" "$HOST" "sudo mkdir -p ${DEST_DIR} && sudo chown -R \$(whoami) ${DEST_DIR}"
rsync -az --delete -e "ssh -p $PORT" \
  --exclude 'deploy' \
  --exclude '.git' \
  ./ "$HOST":"${DEST_DIR}/"

# Install Nginx config and reload
scp -P "$PORT" deploy/nginx.conf "$HOST":/tmp/vestmotor.nginx.conf
ssh -p "$PORT" "$HOST" 'sudo mv /tmp/vestmotor.nginx.conf /etc/nginx/sites-available/vestmotor && \
  sudo ln -sf /etc/nginx/sites-available/vestmotor /etc/nginx/sites-enabled/vestmotor && \
  sudo nginx -t && sudo systemctl reload nginx || sudo systemctl restart nginx'

echo "Deployed to $HOST on port ${PORT}. Browse: http://$(echo "$HOST" | cut -d@ -f2):8080"
