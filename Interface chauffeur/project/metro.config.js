const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver alias for web platform to handle native-only modules
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, 'metro-empty-module.js'),
};

// Add to extraNodeModules for more robust resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, 'metro-empty-module.js'),
};

module.exports = config;