#!/usr/bin/env bash
set -euo pipefail

# This script ensures only files under public/locales/ are staged for commit.
# It exits non-zero if any staged path is outside that directory.

if ! git diff --cached --name-only >/dev/null 2>&1; then
  echo "Git repository not initialized." >&2
  exit 1
fi

CHANGED=$(git diff --cached --name-only)

if [ -z "$CHANGED" ]; then
  echo "No staged changes."
  exit 0
fi

VIOLATIONS=$(echo "$CHANGED" | grep -v '^public/locales/' || true)

if [ -n "$VIOLATIONS" ]; then
  echo "Aborting: staged changes include non-locale paths:" >&2
  echo "$VIOLATIONS" >&2
  exit 2
fi

echo "Guard passed: only public/locales/ changes are staged."

