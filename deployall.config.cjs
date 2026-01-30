module.exports = {
  apps: [
    {
      name: "api-constancias-dev",
      script: "server.js",
      env: {
        NODE_ENV: "development",
        PORT: 3002,
        DRIVE_API_BASE:"https://api-cotizaciones.desarrolloeg.com"
      }
    },
    {
      name: "api-constancias-prod",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        DRIVE_API_BASE: "https://api-cotizaciones.desarrolloeg.com"
      }
    }
  ]
};
