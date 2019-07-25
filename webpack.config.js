const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const devConfig = {
  entry: {
    main: './src/main.js'
  },

  output: {
    filename: '[hash]-[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: "/",
    chunkFilename: "[name].chunk.js"
  },

  devtool: 'inline-source-map',

  mode: 'development',

  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://localhost:4000/',
        ws: true
      }
    },
    // 处理路由系统BroserHistory 404的问题
    historyApiFallback: true
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      minSize: 30000,
      name: true,
      cacheGroups: {
        commons: {
          test: /[\\/]src[\\/]/,
          name: "commons",
          chunks: "all",
        },
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
        }
      }
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html')
    }),
    new ExtractTextPlugin({
      filename: "[hash]-styles.css",
      allChunks: true // 白屏问题
    }),
    new CleanWebpackPlugin(['dist'])
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
            }
          }]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'cache-loader' }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: 'images/',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },

  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components/index.js')
    }
  }
}


module.exports = devConfig;