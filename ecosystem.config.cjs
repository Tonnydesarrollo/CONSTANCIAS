module.exports = {
  apps: [
    {
      name: "api-constancias-dev",
      script: "server.js",
      env: {
        NODE_ENV: "development",
        PORT: 3002
      }
    },
    {
      name: "api-constancias-prod",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      }
    }
  ]
};
