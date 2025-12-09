// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
