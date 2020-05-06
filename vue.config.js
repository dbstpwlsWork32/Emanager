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
  }
}
