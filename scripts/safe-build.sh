#!/usr/bin/env bash
#
# safe-build.sh — memory-guarded `next build` for this 16 GB Intel Mac.
#
# Why this exists: a plain `next build` here can push the system into heavy
# swap. Once macOS thrashes on swap, the whole machine goes unresponsive and
# the kernel watchdog panics ("no successful checkins from remoted in 180s").
#
# This wrapper runs the build while polling two sudo-free signals:
#   * kern.memorystatus_level  — % of memory free (whole system)
#   * vm.swapusage             — how much swap is in use
# If either crosses a danger threshold for two consecutive checks (~4 s, far
# under the 180 s watchdog limit), it kills the entire build process group
# cleanly. You lose the build, not the machine.
#
# Tune via env vars, e.g.:  FREE_PCT_FLOOR=15 SWAP_LIMIT_MB=1500 npm run build:safe
#
set -uo pipefail

FREE_PCT_FLOOR="${FREE_PCT_FLOOR:-10}"   # abort if free memory % drops below this
SWAP_LIMIT_MB="${SWAP_LIMIT_MB:-2000}"   # abort if swap in use exceeds this many MB
POLL_SECONDS="${POLL_SECONDS:-2}"        # how often to check
HEAP_MB="${HEAP_MB:-4096}"               # V8 heap ceiling for the JS/type-check side

# Cap the Node heap so the JS side fails with a clean OOM instead of ballooning
# into swap. (Turbopack's native memory is separate; the worker cap in
# next.config.ts + the monitor below cover that.)
export NODE_OPTIONS="--max-old-space-size=${HEAP_MB} ${NODE_OPTIONS:-}"

printf '▶ safe-build: heap=%sMB  abort when free<%s%% or swap>%sMB  (poll %ss)\n' \
  "$HEAP_MB" "$FREE_PCT_FLOOR" "$SWAP_LIMIT_MB" "$POLL_SECONDS"

# Run the build in its own process group so we can kill the whole tree.
set -m
npm run build &
BUILD_PID=$!

abort() {
  printf '\n✋ safe-build: %s\n   Killing the build to protect the machine.\n' "$1"
  kill -TERM -"$BUILD_PID" 2>/dev/null
  sleep 2
  kill -KILL -"$BUILD_PID" 2>/dev/null
  wait "$BUILD_PID" 2>/dev/null
  exit 2
}

strikes=0
while kill -0 "$BUILD_PID" 2>/dev/null; do
  free_pct="$(sysctl -n kern.memorystatus_level 2>/dev/null || echo 100)"

  # vm.swapusage line: "total = X.XXM  used = Y.YYM  free = Z.ZZM  (encrypted)"
  swap_used_mb="$(sysctl -n vm.swapusage 2>/dev/null | awk '
    { for (i = 1; i <= NF; i++) if ($i == "used") {
        v = $(i + 2); n = v; sub(/[A-Za-z].*/, "", n);
        if (v ~ /G/) printf "%d", n * 1024; else printf "%d", n;
      } }')"
  swap_used_mb="${swap_used_mb:-0}"

  danger=""
  if [ "$free_pct" -lt "$FREE_PCT_FLOOR" ]; then
    danger="free memory ${free_pct}% < ${FREE_PCT_FLOOR}%"
  elif [ "$swap_used_mb" -gt "$SWAP_LIMIT_MB" ]; then
    danger="swap in use ${swap_used_mb}MB > ${SWAP_LIMIT_MB}MB"
  fi

  if [ -n "$danger" ]; then
    strikes=$((strikes + 1))
    printf '⚠ safe-build: %s (strike %s/2)\n' "$danger" "$strikes"
    [ "$strikes" -ge 2 ] && abort "$danger sustained"
  else
    strikes=0
  fi

  sleep "$POLL_SECONDS"
done

wait "$BUILD_PID"
code=$?
printf '✔ safe-build: next build exited with code %s\n' "$code"
exit "$code"
