#!/usr/bin/env bash
# Route apt around package mirrors that would stall `playwright install
# --with-deps`, BEFORE it runs. Every suite workflow runs this one script
# (tests/ci-browser-setup.test.ts holds them to it and executes it).
#
# Two failures, two answers:
#   • DEAD mirror (2026-10-07: apt hung 39 and 55 minutes). Every mirror left in
#     a mirror+file list must answer one bounded index fetch, or it is left out.
#   • ALIVE-BUT-SLOW mirror (azure.archive.ubuntu.com, repeatedly): its small
#     index answers at once and the package downloads crawl into the install's
#     ten-minute bound. No small-file probe can see that, so the implicated host
#     is BYPASSED by name — dropped from a mirror list that has another mirror,
#     and rewritten to the trusted Ubuntu archive in a direct source line.
#
# Only Ubuntu archive entries naming a bypassed host are touched; suites,
# components, Signed-By and every third-party source stay exactly as they
# are, and nothing disables signature or TLS checks. If no usable source is
# left, it fails HERE, clearly, instead of letting apt hang.
#
# Test seams (never set in CI): APT_PREP_ROOT stands in for `/`,
# APT_BYPASS_HOSTS / APT_FALLBACK_URI / APT_PROBE_SECONDS stand in for the
# defaults below, so the logic runs against scratch layouts and local servers.
set -u

etc="${APT_PREP_ROOT:-}/etc"
bypass="${APT_BYPASS_HOSTS-azure.archive.ubuntu.com}"
fallback="${APT_FALLBACK_URI:-http://archive.ubuntu.com/ubuntu/}"
bound="${APT_PROBE_SECONDS:-5}"
codename=$(. "$etc/os-release" && echo "$VERSION_CODENAME")

host_of() { local h=${1#*://}; h=${h%%/*}; echo "${h%%:*}"; }
bypassed() {
  local h; h=$(host_of "$1")
  for b in $bypass; do [ "$h" = "$b" ] && return 0; done
  return 1
}
answers() { curl -fsS --max-time "$bound" -o /dev/null "${1%/}/dists/$codename/InRelease"; }

# 1. mirror+file lists: drop bypassed hosts, then every mirror that does not answer.
lists=$(grep -rhosE 'mirror\+file:[^[:space:]]+' "$etc/apt/sources.list" "$etc/apt/sources.list.d/" 2>/dev/null | sed 's/^mirror+file://' | sort -u || true)
for list in $lists; do
  list="${APT_PREP_ROOT:-}$list"
  if [ ! -f "$list" ]; then
    echo "::warning::apt sources name the mirror list $list, which does not exist; nothing to route"
    continue
  fi
  kept=''
  while IFS= read -r line || [ -n "$line" ]; do
    url=${line%%[[:space:]]*}
    case $url in
      http://*|https://*)
        if bypassed "$url"; then echo "::notice::apt mirror $url bypassed (known to stall package downloads); left out of $list"
        elif answers "$url"; then kept="$kept$line"$'\n'
        else echo "::warning::apt mirror $url did not answer within $bound s; left out of $list"; fi ;;
      *) kept="$kept$line"$'\n' ;;
    esac
  done < "$list"
  if ! printf '%s' "$kept" | grep -qE '^https?://'; then
    if answers "$fallback"; then
      kept="$kept$fallback"$'\n'
      echo "::notice::no mirror in $list was usable; the Ubuntu archive $fallback is used instead"
    else
      echo "::error::no apt mirror in $list answered within $bound s, nor $fallback — the browser install cannot get its packages"
      exit 1
    fi
  fi
  printf '%s' "$kept" | sudo tee "$list" > /dev/null
done

# 2. Direct sources (deb822 `URIs:` and one-line `deb`) naming a bypassed host:
#    only the scheme and host change, to the archive's; the path, suites,
#    components and options on the line stay exactly as written.
origin=$(printf '%s' "$fallback" | sed -E 's#^(https?://[^/]+).*#\1#')
direct=$(grep -rlE "^(URIs:|deb(-src)?)[[:space:]].*https?://" "$etc/apt/sources.list" "$etc/apt/sources.list.d/" 2>/dev/null || true)
for file in $direct; do
  origins=$(grep -oE 'https?://[^/[:space:]]+' "$file" | sort -u)
  for from in $origins; do
    bypassed "$from" || continue
    if ! answers "$fallback"; then
      echo "::error::$file names $from, which is bypassed, and $fallback did not answer within $bound s — the browser install cannot get its packages"
      exit 1
    fi
    sed "s#${from}/#${origin}/#g" "$file" | sudo tee "$file.routed" > /dev/null && sudo mv "$file.routed" "$file"
    echo "::notice::apt source $from in $file bypassed (known to stall package downloads); now $origin"
  done
done

[ -n "$lists" ] || [ -n "$direct" ] || echo '::warning::no apt source on this image names a mirror list or an archive; nothing to route'
exit 0
