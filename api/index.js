const app = require('../server/app');

// Vercel Serverless Function entry point
module.exports = (req, res) => {
  return app(req, res);
};
