# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2026-10-14

### Added
- Block a domain together with all of its subdomains.
- Purge a domain's existing history as soon as it is added, and sweep all history at browser startup.
- Forget recently closed tabs and windows on blocked domains in Firefox and LibreWolf.
- Block the current site from the toolbar popup, with an editable domain field.
- Import and export the blocklist as plain text, one domain per line.
- Migrate 2.x rules automatically, and list the ones that can't be converted on the options page.
- Support Firefox and LibreWolf 121+ and Chrome/Brave 121+ from a single manifest.

### Changed
- Move to Manifest V3; Chrome and Brave no longer load the Manifest V2 build.
- Replace glob expressions with plain domains, so `x.com` no longer matches `x.computer.net`.
- Rewrite the options page and popup in plain HTML and JavaScript, with dark mode support.
- Reduce permissions to `history`, `storage` and `activeTab`, plus `sessions` and `tabs` in Firefox to read and forget closed tabs.

### Removed
- "Keep history for N days" setting.
- Deleted-entries counter and the visit-count badge on the toolbar icon.
- Path-based rules such as `reddit.com/r/*/comments/*`.
- React, Redux, Bootstrap, Font Awesome and the webpack/Babel build.

### Fixed
- Stop blocked visits from staying in history when they arrive while the extension is starting up.
- Delete history for subdomains such as `api.x.com` when `x.com` is blocked.

## [2.0.2] - 2017-08-16

### Fixed
- Repair settings saved by earlier versions that were missing fields (#23).

## [2.0.1] - 2017-08-15

### Fixed
- Run the 1.x settings migration before anything else reads the settings (#23).

## [2.0.0] - 2017-08-14

### Added
- Delete history by path, e.g. `reddit.com/r/*/comments/*`.

### Changed
- Match domains with wildcard expressions such as `git*b.com` instead of exact strings.
- Rebuild the extension with React and Redux; settings and domain lists migrate automatically.
- Refresh the UI with Bootstrap.
- Lists exported from 1.x can no longer be imported.

## [1.1.0] - 2017-02-11

### Changed
- Clean up internal code.

## [1.0.0] - 2017-01-26

### Added
- Default Settings button in the settings page.
- New icon and color theme.

## [0.9.0] - 2017-01-17

### Added
- Show how many history entries the current domain has on the toolbar icon.
- Clear all history for the current domain on demand.
- Tooltips and release notes on the welcome screen.

### Changed
- New icon badge colors and popup visual tweaks.
- Use the × character for remove buttons and give inputs sensible widths.

### Fixed
- Re-importing the same file after removing all domains.
- Exported text files not downloading in Firefox.

## [0.8.0] - 2017-01-16

### Added
- Count how many history entries have been deleted.

### Changed
- Make the settings menu responsive and refresh its visuals.

## [0.7.0] - 2017-01-12

### Added
- Export and import the domain list.
- Show when the icon is disabled on pages that aren't HTTP or HTTPS.

### Fixed
- Table not updating after removing a domain.
- "Keep days" accepting negative values.
- Compatibility with Chrome.

## [0.6.0] - 2017-01-11

### Added
- Keep history for a chosen number of days.
- Add domains by typing them in.

### Changed
- Redesign the settings menu and switch to blue icons.

## [0.5.1] - 2017-01-03

### Added
- First release.
