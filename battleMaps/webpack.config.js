const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8080,
    open: true,
    historyApiFallback: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
      },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'index.html',
          to: 'index.html',
        },
        {
            from: 'css',
            to: 'css',  
        },        
        {
            from: 'assets',
            to: 'assets',
        },
      ],
    }),
  ],
};