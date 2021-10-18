const path = require('path')

module.exports = {
  outputDir: path.resolve(__dirname, '../view-dist'),

  chainWebpack: (config) => {
    config.resolve.symlinks(false) // allow symlinking external resources
  }
//   assetsDir: '../view-dist/assets/'
}
