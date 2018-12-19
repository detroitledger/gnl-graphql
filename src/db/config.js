const config = require('config');

// The config module determines which config files to load based on NODE_ENV
module.exports = {
  development: config.get('database'),
  test: config.get('database'),
  production: config.get('database'),
};