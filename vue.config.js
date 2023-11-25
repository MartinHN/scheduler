const path = require('path')
const zlib = require('zlib')
// const CompressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = {
  outputDir: process.env.ANDROID ? path.resolve(__dirname, '../androidjs/views/view-dist') : path.resolve(__dirname, '../view-dist'),
  publicPath: process.env.ANDROID ? 'file:///android_asset/myapp/views/view-dist' : undefined,
  filenameHashing: false,
  // chainWebpack: (config) => {
  //   config.resolve.symlinks(false) // allow symlinking external resources
  //   config.module.rule('eslint').use('eslint-loader').options({ // fix eslint
  //     fix: true
  //   })
  //   // config.plugin('gzip')
  //   // .use(CompressionWebpackPlugin, [{
  //   //   algorithm: 'gzip',
  //   //   test: new RegExp('\\.(' + ['js', 'css','png'].join('|') + ')$'),
  //   //   threshold: 8192,
  //   //   minRatio: 0.8,
  //   //   cache: true
  //   // }])
  // },

  pluginOptions: {
    compression: {

      // brotli: {
      //   filename: '[file].br[query]',
      //   algorithm: 'brotliCompress',
      //   include: /\.(js|css|html|svg|json|png)(\?.*)?$/i,
      //   compressionOptions: {
      //     params: {
      //       [zlib.constants.BROTLI_PARAM_QUALITY]: 11
      //     }
      //   },
      //   minRatio: 0.8
      // },

      gzip: {
        filename: '[file].gz[query]',
        algorithm: 'gzip',
        compressionOptions: {
          level: zlib.constants.Z_BEST_COMPRESSION
        },
        include: /\.(js|css|html|svg|json|png)(\?.*)?$/i,
        minRatio: 0.8
      }
    }
  }

  //   assetsDir: '../view-dist/assets/'
}
