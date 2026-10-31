#!/bin/sh
# Scan the Setar archive and publish its index. This is the whole production
# job: a DSM scheduled task runs THIS file, nothing else.
#
#   sh run-setar-index.sh                      # the scheduled task
#   sh run-setar-index.sh <contentHash> <lock>  # the maintenance route: publish
#                                              # only if THIS scan is the index
#                                              # it validated (refused before
#                                              # any request otherwise, exit 3)
#                                              # and while that run still holds
#                                              # the archive's maintenance lock
#
# Before its ref write the publisher scans the archive again and checks its
# maintenance lock: the scheduled run refuses (exit 4) while a maintenance run
# holds it, and any run refuses once the archive has moved on from its scan.
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
# Exits that PROVE nothing was published: 2 (configuration refused, nothing
# ran), 3 (the scan was not the validated index) and 4 (the scan, or the
# publisher before its ref write, failed). Any other failure may have come after GitHub accepted the
# ref: unknown, and running the job again is safe (unchanged makes no commit).
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

for v in PC_ARCHIVE_ROOT PC_INDEX_REPO PC_INDEX_TOKEN; do
  eval "[ -n \"\${$v:-}\" ]" || { echo "$v is not set; nothing was published." >&2; exit 2; }
done
export PC_INDEX_REPO PC_INDEX_TOKEN

HERE=$(cd "$(dirname "$0")" && pwd)
NODE="${PC_NODE:-node}"
# The scratch index lives in the RUNTIME directory, never inside the archive.
# This job creates no folder: a missing one is a configuration error, and a
# guessed one could land anywhere a mount happens to resolve.
WORK="${PC_INDEX_WORKDIR:-$(dirname "$CONFIG")}"
OUT="$WORK/setar-index.json"

if [ ! -d "$WORK" ]; then
  echo "Work directory $WORK does not exist; nothing was scanned or published." >&2
  exit 2
fi

# Scan first. If it fails, stop here: the published index is still the good one.
"$NODE" "$HERE/scan-setar-classes.mjs" --root "$PC_ARCHIVE_ROOT" --out "$OUT" || {
  echo "The scan failed; nothing was published." >&2
  exit 4
}

# Then publish. An unchanged index makes no commit. Its last stdout line,
# `published-index <status> <contentHash>`, is the evidence a caller checks.
if [ "$#" -gt 1 ]; then
  "$NODE" "$HERE/publish-setar-index.mjs" --index "$OUT" --root "$PC_ARCHIVE_ROOT" --expect "$1" --holder "$2"
elif [ "$#" -gt 0 ]; then
  "$NODE" "$HERE/publish-setar-index.mjs" --index "$OUT" --root "$PC_ARCHIVE_ROOT" --expect "$1"
else
  "$NODE" "$HERE/publish-setar-index.mjs" --index "$OUT" --root "$PC_ARCHIVE_ROOT"
fi
