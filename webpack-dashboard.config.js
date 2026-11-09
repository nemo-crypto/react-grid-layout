const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  entry: './demo/index.jsx',
  output: { path: path.resolve(__dirname, 'demo-dist'), filename: 'assets/[name].[contenthash:8].js', publicPath: '/', clean: true },
  module: { rules: [
    { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] }
  ] },
  resolve: { extensions: ['.js', '.jsx'], alias: { 'react-grid-layout': path.resolve(__dirname, 'index-dev.js') } },
  plugins: [new HtmlWebpackPlugin({ template: './demo/index.html' })],
  devtool: argv.mode === 'production' ? false : 'eval-source-map',
  devServer: { host: '127.0.0.1', port: 4002, open: false, historyApiFallback: true, static: false },
  performance: { hints: false }
});
