const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './src/index.js',

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Resolve configuration
  resolve: {
    // Exclude 'got' and 'http2-wrapper' from the build process
    alias: {
      got: false,
      'http2-wrapper': false
    }
  }
};
