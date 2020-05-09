module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        extraFiles: [{
          from: "resources/win/bin",
          to: "Resources/bin",
          filter: [
            "**/*"
          ]
        }]
      }
    }
  },
  configureWebpack: config => {
    config.module.rules.push({
      test: /node_modules[\/\\](iconv-lite)[\/\\].+/,
      resolve: {
        aliasFields: ['main']
      }
    })
  }
}
