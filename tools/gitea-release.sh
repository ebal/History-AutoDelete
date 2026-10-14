#!/bin/bash
# Creates a Gitea release for a tag and uploads every file in builds/ to it.
# Expects GITEA_API (e.g. https://gitea.example/api/v1/repos/owner/repo) and
# GITEA_TOKEN in the environment. Used by .gitea/workflows/release.yml.
set -euo pipefail

readonly E_NOARGS=2
readonly E_XCD=3
readonly E_NOENV=4
readonly E_NOASSETS=5

if [ -z "${1:-}" ] || [ -z "${2:-}" ]; then
	echo "usage: $0 <tag> <notes-file>" >&2
	exit "$E_NOARGS"
fi
if [ -z "${GITEA_API:-}" ] || [ -z "${GITEA_TOKEN:-}" ]; then
	echo "GITEA_API and GITEA_TOKEN must be set" >&2
	exit "$E_NOENV"
fi

tag="$1"
notes_file="$2"

cd "$(dirname "$0")/.." || exit "$E_XCD"

shopt -s nullglob
assets=(builds/*)
if [ "${#assets[@]}" -eq 0 ]; then
	echo "nothing to upload in builds/" >&2
	exit "$E_NOASSETS"
fi

api() {
	curl --fail-with-body --silent --show-error \
		-H "Authorization: token $GITEA_TOKEN" "$@"
}

release_id=$(jq -n --arg tag "$tag" --rawfile body "$notes_file" \
	'{tag_name: $tag, name: $tag, body: $body}' |
	api -X POST -H "Content-Type: application/json" --data @- "$GITEA_API/releases" |
	jq -r .id)

for asset in "${assets[@]}"; do
	api -X POST -F "attachment=@$asset" \
		"$GITEA_API/releases/$release_id/assets?name=$(basename "$asset")" >/dev/null
	echo "uploaded $asset"
done
