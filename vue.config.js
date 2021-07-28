module.exports = {
  transpileDependencies: ["vuetify", "@koumoul/vjsf"],
  configureWebpack: {
    devtool: "source-map",
    devServer: {
      host: '0.0.0.0',
      allowedHosts: ['localhost', '.gitpod.io'],
    }
  }
};
