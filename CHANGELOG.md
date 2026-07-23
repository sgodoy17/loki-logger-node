# Changelog

All notable changes to this project will be documented in this file.

## [v1.1.1](https://github.com/sgodoy17/loki-logger-node/releases/tag/v1.1.1) (2026-07-23)

### Fixed

- Fixed issue where `mask` options were not being applied to structured log objects starting with `-` characters.

## [v1.1.0](https://github.com/sgodoy17/loki-logger-node/releases/tag/v1.1.0) (2026-07-09)

### Added

- Added configurable data masking through the logger configuration.
- Added support for masking sensitive fields in both structured log objects and string messages before writing to stdout and sending logs to Grafana Loki.
- Added configurable masking options, including custom prefix/suffix visibility, fixed mask length, mask character, and built-in email masking.

## [v1.0.2](https://github.com/sgodoy17/loki-logger-node/releases/tag/v1.0.2) (2026-05-14)

### Fixed

- Added `import` condition to `exports` field in `package.json` to fix resolution when bundling with esbuild.

## [v1.0.1](https://github.com/sgodoy17/loki-logger-node/releases/tag/v1.0.1) (2026-05-14)

### Changed

- Updated CI pipeline to trigger on tag push instead of branch push for correct Trusted Publishing OIDC authentication with npm.

## [v1.0.0](https://github.com/sgodoy17/loki-logger-node/releases/tag/v1.0.0) (2026-05-14)

### Breaking Changes

- Replaced `fetch` with `node:http` for socket-level timeout handling, preventing Lambda hangs when Loki is unreachable.

## [v0.0.1](https://github.com/sgodoy17/loki-logger-node/releases/tag/v0.0.1) (2026-05-14)

### Added

- Initial release of Loki Node.js logger integration.
