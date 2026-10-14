# History-AutoDelete

Keeps chosen domains out of your browser history. Add `x.com` to the blocklist and every visit to `x.com` or any `*.x.com` subdomain is deleted from history as soon as the browser records it. Adding a domain also removes the history it already has.

## Features

- Block a domain and all of its subdomains (`x.com` covers `api.x.com`, not `x.community.org`)
- Purge a domain's existing history when you add it, and sweep again at browser startup
- Forget recently closed tabs and windows on a blocked domain (Firefox and LibreWolf)
- Block the current site from the toolbar popup
- Import and export the list as plain text, one domain per line
- Manifest V3 with no third-party code

## Supported browsers

| Browser | Minimum version |
| --- | --- |
| Chrome, Brave and other Chromium browsers | 121 |
| Firefox, LibreWolf | 121 |

## Installation

Load it unpacked from a checkout:

- **Chrome / Brave:** open `chrome://extensions`, enable *Developer mode*, choose *Load unpacked* and select the `extension/` folder.
- **Firefox / LibreWolf:** open `about:debugging#/runtime/this-firefox`, choose *Load Temporary Add-on* and select `extension/manifest.json`.

To build installable packages, run `docker compose run --rm build`. It runs the tests, then writes a Firefox `.xpi` and a Chrome `.zip` to `builds/`. Without Docker, `./tools/build.sh` does the packaging step if Node and `zip` are installed.

The store listings below are for the original 2.x release:
[Chrome Web Store](https://chrome.google.com/webstore/detail/history-autodelete/bhfakmaiadhflpjloimlagikhodjiefj) ·
[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/history-autodelete)

## Usage

- Click the toolbar icon and press **Block** to block the site you are on. Edit the field first to block a parent domain instead, e.g. `x.com` rather than `mobile.x.com`.
- Open the extension's options page to add or remove domains, or to import and export the list.

You can enter a full URL, `www.example.com`, `*.example.com` or an internationalized name. They are all normalized to the bare domain. Single-label names such as `com` are rejected so a typo can't wipe a whole top-level domain.

## Limitations

- Entries are deleted right after the browser records them, so a visit exists in history for a few milliseconds.
- Recently closed tabs and windows on a blocked domain are forgotten in Firefox and LibreWolf. A closed window is forgotten as a whole if any of its tabs is blocked. Chrome and Brave have no API for this, so blocked pages stay in their "Recent tabs" list until you clear browsing data.
- Only a closed tab's current page is checked, so a blocked page further back in that tab's back/forward history is not detected.
- Tabs synced from other devices and session restore data are not touched.
- Private/incognito windows don't write history, so the extension has nothing to do there.

## Upgrading from 2.x

Version 3 replaces glob expressions with plain domains. Rules such as `x.com*` or `*.x.com*` are converted automatically. Rules that matched a path or part of a name (`google.com/maps*`, `*tube*`) can't be converted without deleting more history than they did, so they are listed on the options page for you to review. The 2.x data stays in storage untouched.

"Keep history for N days", the deletion counter and the visit-count badge were removed in 3.0.0. See [CHANGELOG.md](CHANGELOG.md).

## Development

```sh
docker compose run --rm build   # tests + packages in Docker, nothing installed on the host
node --test                     # unit tests (Node 20+)
./tools/build.sh                # Firefox and Chrome packages in builds/ (needs node, zip)
```

- `extension/lib/domains.js`: domain normalization and matching, no browser APIs, covered by the tests
- `extension/background.js`: history listener, purge and 2.x migration
- `extension/options/`, `extension/popup/`: UI in plain HTML and JS

## Releasing

Pushing a `v*` tag builds both packages and attaches them to a release on GitHub and on Gitea:

1. Bump `version` in `extension/manifest.json` and `package.json`.
2. Move the `[Unreleased]` entries in `CHANGELOG.md` into a new `## [X.Y.Z] - YYYY-MM-DD` section.
3. Commit, then tag and push to both remotes:

   ```sh
   git tag vX.Y.Z
   git push origin vX.Y.Z
   git push gitea vX.Y.Z
   ```

Both workflows (`.github/workflows/release.yml`, `.gitea/workflows/release.yml`) run in the same `node` image as `docker-compose.yml`. They run the tests, check that the tag matches the manifest version, build, and publish the release with the matching `CHANGELOG.md` section as its notes. Gitea needs Actions enabled for the repository and a runner with the `ubuntu-latest` label that runs jobs in Docker.

## License

[MIT](LICENSE)
