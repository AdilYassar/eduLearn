module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@config': './src/config',
          '@features': './src/features',
          '@navigation': './src/navigation',
          '@service': './src/service',
          '@styles': './src/styles',
          '@state': './src/state',
          '@types': './src/types',
          '@utils': './src/utils',
          'react-native-webrtc': '@livekit/react-native-webrtc',
        },
      },
    ],
    'react-native-worklets/plugin', // ← changed from react-native-reanimated/plugin
  ],
};