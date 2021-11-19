const path = require('path')

module.exports = {
  outputDir: path.resolve(__dirname, '../view-dist'),

  chainWebpack: (config) => {
    config.resolve.symlinks(false) // allow symlinking external resources
    config.module.rule('eslint').use('eslint-loader').options({ // fix eslint
      fix: true
    })
  }

//   assetsDir: '../view-dist/assets/'
}
