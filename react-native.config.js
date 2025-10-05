module.exports = {
    assets: ['./src/assets/fonts'], // Path to your assets folder

    getTransformModulePath() {
      return require.resolve('react-native-typescript-transformer');
    },
    getSourceExts() {
      return ['js', 'jsx', 'ts', 'tsx', 'json', 'svg'];
    },
  };

  