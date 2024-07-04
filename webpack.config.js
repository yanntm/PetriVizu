const path = require('path');
const webpack = require('webpack');
const { execSync } = require('child_process');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'website/js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'website')
    },
    compress: true,
    port: 1665,
    open: true
  },
  resolve: {
    alias: {
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor')
    },
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'html', 'css']
    }),
    {
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap('ANTLRBuildPlugin', () => {
          execSync('antlr4 -Dlanguage=JavaScript -visitor src/antlr/Properties.g4');
        });
      }
    }
  ],
  mode: 'development'
};
