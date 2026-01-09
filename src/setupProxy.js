const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy para la API de Wargaming
  app.use(
    '/api/wot',
    createProxyMiddleware({
      target: 'https://api.worldoftanks.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/wot': '/wot',
      },
    })
  );
  
  // Proxy para el backend de equipos (solo en desarrollo)
  app.use(
    '/api/teams',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
  
  // Health check del backend
  app.use(
    '/api/health',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};

