// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');

/**
 * Common configuration for both Node.js and Web
 */
const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  // Uncomment the following line to enable source map
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

/**
 * Configuration for a Node.js compatible bundle
 */
const nodeConfig = {
  ...baseConfig,
  name: 'node',
  target: 'node', // For Node.js
  output: {
    filename: 'bundle-node.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd', // We can use `commonjs2` for Node.js
  },
};

/**
 * Configuration for a browser compatible bundle
 */
const webConfig = {
  ...baseConfig,

  name: 'web',
  target: 'web', // For browsers
  output: {
    filename: 'bundle-web.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'LoopBack',
    libraryTarget: 'umd',
  },
};

// Expose two configurations for `webpack`. Use `--config-name <web|node>` to
// select a named entry.
module.exports = [nodeConfig, webConfig];
