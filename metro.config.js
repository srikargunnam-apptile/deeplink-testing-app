const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable package exports so @apptile/tile-modules resolves to its published
// build via the package.json `exports`/`main` field. (The dev-only rewrite to
// the unpublished internal source was removed so this builds in CI/cloud.)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
