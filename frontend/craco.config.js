// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Add resolve fallbacks for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'), // For 'path'
        fs: false, // For 'fs', using an empty module
        constants: require.resolve('constants-browserify'), // For 'constants'
        child_process: false, // For 'child_process', using an empty module
        util: require.resolve('util/'), // For 'util'
        stream: require.resolve('stream-browserify'), // For 'stream'
        http: require.resolve('stream-http'), // For 'http'
        https: require.resolve('https-browserify'), // For 'https'
        querystring: require.resolve('querystring-es3'), // For 'querystring'
        assert: require.resolve('assert/'), // For 'assert'
        os: require.resolve('os-browserify/browser'), // For 'os'
        buffer: require.resolve('buffer/'), // For 'buffer'
        vm: require.resolve('vm-browserify'), // For 'vm'
        url: require.resolve('url/'), // For 'url'
      };
      return webpackConfig;
    }
  }
};
