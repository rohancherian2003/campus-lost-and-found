const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  remotes: {
    "authApp": "http://localhost:4201/remoteEntry.js",
    "dashboardApp": "http://localhost:4202/remoteEntry.js",
    "lostItemsApp": "http://localhost:4203/remoteEntry.js",
    "foundItemsApp": "http://localhost:4204/remoteEntry.js",    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
