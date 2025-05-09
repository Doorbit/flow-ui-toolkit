module.exports = {
  devServer: {
    // Direkte Konfiguration des DevServers
    setupMiddlewares: (middlewares, devServer) => {
      // Hier können wir benutzerdefinierte Middleware-Logik hinzufügen
      return middlewares;
    }
  }
};
