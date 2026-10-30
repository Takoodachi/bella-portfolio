#!/bin/bash
# Build the site the way GitHub Pages does (needs Docker running) into _site/, then serve it on :8321.
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd -W 2>/dev/null || pwd)"   # Windows path under Git Bash, so Docker can mount it
rm -rf _site && mkdir -p _site
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$ROOT:/github/workspace/src:ro" -v "$ROOT/_site:/github/workspace/out" \
  -e GITHUB_WORKSPACE=/github/workspace -e INPUT_SOURCE=src -e INPUT_DESTINATION=out \
  -e GITHUB_REPOSITORY=Takoodachi/bella-portfolio -e INPUT_BUILD_REVISION=local \
  ghcr.io/actions/jekyll-build-pages:v1.0.13
exec python -m http.server "${PORT:-8321}" --directory _site
