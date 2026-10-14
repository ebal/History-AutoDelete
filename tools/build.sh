#!/bin/bash
# Packages extension/ for Firefox (.xpi) and Chrome (.zip) into builds/.
# The Chrome manifest drops the Firefox-only keys, and the sessions/tabs
# permissions that only Firefox can use (to forget recently closed tabs).
set -euo pipefail

readonly E_XCD=3

cd "$(dirname "$0")/.." || exit "$E_XCD"

name="History-AutoDelete"
version=$(node -p 'require("./extension/manifest.json").version')
out="$PWD/builds"
staging=$(mktemp -d)
trap 'rm -rf "$staging"' EXIT

mkdir -p "$out"

(cd extension && zip -qr "$out/${name}_Firefox_${version}.xpi" .)

cp -r extension/. "$staging"
# shellcheck disable=SC2016 # the quoted text is JavaScript, not shell
node -e '
	const fs = require("fs");
	const path = process.argv[1];
	const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
	delete manifest.browser_specific_settings;
	delete manifest.background.scripts;
	manifest.permissions = manifest.permissions.filter((p) => !["sessions", "tabs"].includes(p));
	fs.writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
' "$staging/manifest.json"
(cd "$staging" && zip -qr "$out/${name}_Chrome_${version}.zip" .)

echo "Built $out/${name}_Firefox_${version}.xpi and $out/${name}_Chrome_${version}.zip"
