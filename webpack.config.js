module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'postcss-import',
                  'tailwindcss',
                  'autoprefixer',
                ],
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
}; 