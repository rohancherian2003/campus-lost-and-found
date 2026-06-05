export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  remotes: {
    authApp: 'http://localhost:4201/remoteEntry.js',
    dashboardApp: 'http://localhost:4202/remoteEntry.js',
    lostItemsApp: 'http://localhost:4203/remoteEntry.js',
    foundItemsApp: 'http://localhost:4204/remoteEntry.js'
  }
};
