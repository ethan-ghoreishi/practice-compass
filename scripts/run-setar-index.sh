#!/bin/sh
# Scan the Setar archive and publish its index. This is the whole production
# job: a DSM scheduled task runs THIS file, nothing else.
#
#   sh run-setar-index.sh
#
# Configuration comes from a protected operator file — never from the archive,
# never from the app, never from a commit. Default location:
#
#   /volume1/practice-compass-index/config.env          (chmod 600)
#     PC_ARCHIVE_ROOT=/volume1/media/setar-classes      # read-only mount
#     PC_INDEX_REPO=owner/practice-compass-data
#     PC_INDEX_TOKEN=...                                # this repo only:
#                                                       # Contents write +
#                                                       # metadata read
#
# Override with PC_INDEX_CONFIG=/some/other/config.env.
#
# WHAT THIS JOB MAY DO: read the archive, write ONE scratch file in its own
# runtime directory, and update source-index/setar/index.json. Nothing else.
# A failed scan or a failed publish leaves the last published index in place,
# which is what the app keeps reading.
#
# ROLLBACK: disable the scheduled task. The app keeps the source graph it last
# accepted and goes on working offline; `git push --force-with-lease` of an
# earlier source-index commit restores an earlier index. Neither touches the
# app's own data on main.

set -eu

CONFIG="${PC_INDEX_CONFIG:-/volume1/practice-compass-index/config.env}"
if [ -r "$CONFIG" ]; then
  # shellcheck disable=SC1090
  . "$CONFIG"
else
  echo "No readable config at $CONFIG; nothing was published." >&2
  exit 2
fi

: "${PC_ARCHIVE_ROOT:?PC_ARCHIVE_ROOT is not set}"
: "${PC_INDEX_REPO:?PC_INDEX_REPO is not set}"
: "${PC_INDEX_TOKEN:?PC_INDEX_TOKEN is not set}"
export PC_INDEX_REPO PC_INDEX_TOKEN

HERE=$(cd "$(dirname "$0")" && pwd)
NODE="${PC_NODE:-node}"
# The scratch index lives in the RUNTIME directory, never inside the archive.
WORK="${PC_INDEX_WORKDIR:-$(dirname "$CONFIG")}"
OUT="$WORK/setar-index.json"

mkdir -p "$WORK"

# Scan first. If it fails, stop here: the published index is still the good one.
"$NODE" "$HERE/scan-setar-classes.mjs" --root "$PC_ARCHIVE_ROOT" --out "$OUT"

# Then publish. An unchanged index makes no commit.
"$NODE" "$HERE/publish-setar-index.mjs" --index "$OUT"
