# History-AutoDelete

Keeps chosen domains out of your browser history. Add `x.com` to the blocklist and every visit to `x.com` or any `*.x.com` subdomain is deleted from history as soon as the browser records it. Adding a domain also removes the history it already has.

## Features

- Block a domain and all of its subdomains (`x.com` covers `api.x.com`, not `x.community.org`)
- Purge a domain's existing history when you add it, and sweep again at browser startup
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

To build installable packages, run `./tools/build.sh`. It writes a Firefox `.xpi` and a Chrome `.zip` to `builds/`.

The store listings below are for the original 2.x release:
[Chrome Web Store](https://chrome.google.com/webstore/detail/history-autodelete/bhfakmaiadhflpjloimlagikhodjiefj) ·
[Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/history-autodelete)

## Usage

- Click the toolbar icon and press **Block** to block the site you are on. Edit the field first to block a parent domain instead, e.g. `x.com` rather than `mobile.x.com`.
- Open the extension's options page to add or remove domains, or to import and export the list.

You can enter a full URL, `www.example.com`, `*.example.com` or an internationalized name. They are all normalized to the bare domain. Single-label names such as `com` are rejected so a typo can't wipe a whole top-level domain.

## Limitations

- Entries are deleted right after the browser records them, so a visit exists in history for a few milliseconds.
- Recently closed tabs and the browser's session restore data are not touched.
- Private/incognito windows don't write history, so the extension has nothing to do there.

## Upgrading from 2.x

Version 3 replaces glob expressions with plain domains. Rules such as `x.com*` or `*.x.com*` are converted automatically. Rules that matched a path or part of a name (`google.com/maps*`, `*tube*`) can't be converted without deleting more history than they did, so they are listed on the options page for you to review. The 2.x data stays in storage untouched.

"Keep history for N days", the deletion counter and the visit-count badge were removed in 3.0.0. See [CHANGELOG.md](CHANGELOG.md).

## Development

```sh
node --test test/     # unit tests (Node 20+)
./tools/build.sh      # Firefox and Chrome packages in builds/
```

- `extension/lib/domains.js`: domain normalization and matching, no browser APIs, covered by the tests
- `extension/background.js`: history listener, purge and 2.x migration
- `extension/options/`, `extension/popup/`: UI in plain HTML and JS

## License

[MIT](LICENSE)
