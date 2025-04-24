module.exports = {
    assets: ['./assets/fonts'], // Path to your assets folder (e.g., fonts or other custom assets)

    getTransformModulePath() {
      return require.resolve('react-native-typescript-transformer');
    },
    getSourceExts() {
      return ['js', 'jsx', 'ts', 'tsx', 'json', 'svg'];
    },


  };

  