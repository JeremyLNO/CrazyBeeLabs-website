#!/usr/bin/env bash
# One-command ship: commit all changes and push.
# Vercel then builds & deploys `main` automatically.
#
#   ./scripts/ship.sh "your message"
set -e
cd "$(dirname "$0")/.."

msg="${1:-Update}"
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi
git commit -m "$msg"
git push
echo "✅ Pushed to main — Vercel will build & deploy automatically."
