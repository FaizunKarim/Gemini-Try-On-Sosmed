// Vercel Serverless Function Proxy Endpoint
// Meneruskan permintaan ke handler utama di server/proxy.js
const serverHandler = require('../server/proxy.js');

module.exports = async function handler(req, res) {
  return await serverHandler(req, res);
};