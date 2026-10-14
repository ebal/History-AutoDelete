#!/bin/bash
# Prints the CHANGELOG.md section for a release tag (e.g. v3.0.0), after
# checking that the tag matches the version in extension/manifest.json.
# Used by the GitHub and Gitea release workflows.
set -euo pipefail

readonly E_NOARGS=2
readonly E_XCD=3
readonly E_VERSION=4
readonly E_NONOTES=5

if [ -z "${1:-}" ]; then
	echo "usage: $0 <tag>" >&2
	exit "$E_NOARGS"
fi

cd "$(dirname "$0")/.." || exit "$E_XCD"

tag="$1"
version="${tag#v}"
manifest_version=$(node -p 'require("./extension/manifest.json").version')

if [ "$version" != "$manifest_version" ]; then
	echo "tag $tag does not match manifest version $manifest_version" >&2
	exit "$E_VERSION"
fi

notes=$(awk -v heading="## [$version]" '
	/^## \[/ { if (found) exit; if (index($0, heading) == 1) { found = 1; next } }
	found
' CHANGELOG.md)

if [ -z "${notes//[[:space:]]/}" ]; then
	echo "no CHANGELOG.md section for [$version]" >&2
	exit "$E_NONOTES"
fi

printf '%s\n' "$notes"
