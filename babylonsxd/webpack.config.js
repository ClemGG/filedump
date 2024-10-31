const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const isDevMode = true;

module.exports = 
{
  // mode: process.env.NODE_ENV || 'development',
  mode: isDevMode ? "development" : "production",
  devtool: false,

  resolve: 
  {
    alias: {
      // aliases used in HTML, CSS
      '@textures': path.join(__dirname, 'src/textures'),
      '@fonts': path.join(__dirname, 'src/fonts'),
    },
    extensions: [".ts", ".js", ".json"],
  },
  
  module: 
  {
    rules: 
    [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.(s?css)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|gif|png|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.(woff2?|ttf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'font/[name].[hash:8][ext][query]',
        },
      },
    ],
  },

  // entry: 
  // {
  //   index: './src/index.ts',
  //   editor: './src/editor.ts',
  // },

  plugins: 
  [ 
    // , new WebpackBundleAnalyzer()
    new HtmlBundlerPlugin({
      entry: {
        'index': './src/index.html', // => dist/index.html
        'editor': './src/editor.html', // => dist/editor.html
      },
      js: {
        filename: 'js/[name].[contenthash:8].js', // output JS filename
      },
      css: {
        filename: 'css/[name].[contenthash:8].css', // output CSS filename
      },
    }),
  ],

  output: 
  {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  optimization: 
  {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  // enable live reload
  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};