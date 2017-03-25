const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, 'src'),
  entry: [
    './index.js'
  ],


  output: {
    path: path.resolve(__dirname, "static"),
    filename: 'bundle.js',
    publicPath: 'static',
    library: 'yarl',
  },

  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, 'static'),
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:*"
    },

    publicPath: '/',

    proxy: {
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.(png|woff2|svg|ttf|woff|eot)(\?.*)?$/,
        loader: "url",
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],

}
