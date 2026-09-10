# Releasing

H-Mode currently installs directly from GitHub. It does not claim ownership of
an npm package name. Publishing is disabled by `private: true` in package.json
and the `H_MODE_ENABLE_NPM_PUBLISH` repository-variable gate in publish.yml.
No npm package or GitHub release was created by this migration.

## Optional maintainer setup

1. Choose and verify an npm package name you control; update package.json and
   any future npm-specific installation instructions.
2. Configure npm trusted publishing for this repository and publish.yml using
   npm's current instructions. Do not copy another project's credentials.
3. Remove `private: true` only when publication is intended.
4. Set repository variable `H_MODE_ENABLE_NPM_PUBLISH=true` only after setup.
5. Keep the version synchronized across package.json, the three plugin
   manifests, gemini-extension.json, and CHANGELOG.md.

## Release checks

Run `npm test`, then the rule/chart/sample builders with `--check`.
Review the package file list and the changelog before creating a version tag.
A `vX.Y.Z` tag must match package.json. With publication enabled, the workflow
tests, publishes with provenance, and creates a GitHub release. Without the
gate, the publish and release jobs are skipped.

Verify the chosen package and release after publication. Use
`npx github:hemanth-create/H-Mode --help` for the current GitHub installation;
do not advertise `npx h-mode` unless you actually control and publish that name.
