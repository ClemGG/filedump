const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const isDevMode = true;


const htmlPageNames = ['index', 'editor'];
const multipleHtmlPlugins = htmlPageNames.map(name => 
{
    return new HtmlWebpackPlugin(
    {
        template: `./${name}.html`, // relative path to the HTML files
        filename: `${name}.html`, // output HTML files
        chunks: [`${name}`] // respective JS files
    });
});


module.exports = 
{
  // mode: process.env.NODE_ENV || 'development',
  mode: isDevMode ? "development" : "production",
  devtool: false,

  resolve: 
  {
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
      }
    ],
  },

  entry: 
  {
    index: './src/index.ts',
    editor: './src/editor.ts',
  },

  plugins: 
  [ 
      //new HtmlWebpackPlugin({ template: './index.html' }),
      // , new WebpackBundleAnalyzer()
  ].concat(multipleHtmlPlugins),

  output: 
  {
    filename: '[name].bundle.js',
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
};