#!/usr/bin/env bash
# OPTIONAL local mirror. The primary home of the app is GitHub Pages
# (deployed automatically by .github/workflows/deploy.yml on every push).
# This script copies the same static build onto a locally mounted NAS share
# for a LAN-only mirror — handy, never required.
#
#   PC_DEPLOY_DIR=/Volumes/web/practice-compass ./scripts/deploy-nas.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="${PC_DEPLOY_DIR:-/Volumes/web/practice-compass}"
SHARE="$(dirname "$DEST")"

if [ ! -d "$SHARE" ]; then
  echo "Share not mounted at $SHARE — mount it (Finder → Go → Connect to Server) or set PC_DEPLOY_DIR."
  exit 1
fi

npm run build

mkdir -p "$DEST"
# -r without -a: SMB does not take POSIX perms/times cleanly.
rsync -rv --delete --exclude '.DS_Store' dist/ "$DEST"/

echo
echo "Mirrored to $DEST"
