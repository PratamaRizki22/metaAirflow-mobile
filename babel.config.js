module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  // Dotenv plugin for environment variables
  plugins.push([
    'module:react-native-dotenv',
    {
      moduleName: '@env',
      path: process.env.APP_ENV === 'production' ? '.env.production' : '.env.local',
      safe: false,
      allowUndefined: true,
    },
  ]);

  // IMPORTANT: react-native-reanimated plugin must be last!
  // This handles both reanimated and gesture-handler
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins,
  };
};
