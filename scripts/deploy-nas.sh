#!/usr/bin/env bash
# Deploys the built app to the Synology Web Station `web` share — same pattern
# as hess / the systema receiver: files copied onto the mounted share, no SSH.
# This app holds personal practice data + your teacher's files, so it is served
# privately from the NAS over Tailscale, never public Pages.
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="${PC_DEPLOY_DIR:-/Volumes/web/practice-compass}"
SHARE="$(dirname "$DEST")"

if [ ! -d "$SHARE" ]; then
  echo "NAS web share is not mounted at $SHARE."
  echo "Finder -> Go -> Connect to Server -> smb://192.168.0.20 -> mount 'web', then retry."
  exit 1
fi

npm run build

mkdir -p "$DEST"
# -r without -a: SMB does not take POSIX perms/times cleanly.
rsync -rv --delete --exclude '.DS_Store' dist/ "$DEST"/

echo
echo "Deployed to $DEST"
echo "Phone (Tailscale on): https://ds220plus.taild1d1f7.ts.net/practice-compass/"
echo "LAN quick check:      http://192.168.0.20/practice-compass/  (no service worker over http)"
