const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const authAppUrl = process.env.AUTH_APP_URL || "http://localhost:4201/remoteEntry.js";
const dashboardAppUrl = process.env.DASHBOARD_APP_URL || "http://localhost:4202/remoteEntry.js";
const lostItemsAppUrl = process.env.LOST_ITEMS_APP_URL || "http://localhost:4203/remoteEntry.js";
const foundItemsAppUrl = process.env.FOUND_ITEMS_APP_URL || "http://localhost:4204/remoteEntry.js";

module.exports = withModuleFederationPlugin({

  remotes: {
    "authApp": authAppUrl,
    "dashboardApp": dashboardAppUrl,
    "lostItemsApp": lostItemsAppUrl,
    "foundItemsApp": foundItemsAppUrl,    
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
