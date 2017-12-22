/* eslint-disable */
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: "Rutracker",
    libraryTarget: "umd",
    libraryExport: 'default'
  },
  plugins: [
    new MinifyPlugin(),
    new UglifyJSPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.join(__dirname, 'src'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          }
        }
      }
    ]
  }
};
