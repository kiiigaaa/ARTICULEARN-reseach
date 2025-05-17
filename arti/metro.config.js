// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
// if you’re using any .cjs dependencies (like firebase v11+), keep this:
defaultConfig.resolver.sourceExts.push('cjs');

// ─────── add this ───────
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
