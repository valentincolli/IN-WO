const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
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
};

