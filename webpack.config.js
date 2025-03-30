const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './scripts/index.js',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true,
    open: true,
    watchFiles: ['scripts/**/*', 'styles/**/*', 'index.html'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
      // Remove favicon reference or ensure the file exists
      // favicon: existsSync('./assets/favicon.ico') ? './assets/favicon.ico' : undefined,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'styles',
          to: 'styles',
          noErrorOnMissing: true, // Prevent errors if folder doesn't exist
        },
        // Only copy assets if the folder exists
        ...(existsSync('./assets')
          ? [
              {
                from: 'assets',
                to: 'assets',
                noErrorOnMissing: true,
              },
            ]
          : []),
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]', // Keep original filenames
        },
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'scripts'),
      path.resolve(__dirname, 'styles'),
      'node_modules',
    ],
  },
};

// Helper function to check file existence
function existsSync(filePath) {
  try {
    require('fs').accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}
