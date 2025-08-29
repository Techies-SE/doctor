module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
        // remove CssMinimizerPlugin entirely
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          (plugin) => plugin.constructor.name !== 'CssMinimizerPlugin'
        );
      }
      return webpackConfig;
    },
  },
};
