const config = require('config');
const { parse } = require('url');

let dbConfig = config.get('database');

if (process.env.DATABASE_URL) {
  const parsed = parse(process.env.DATABASE_URL);
  if (!parsed) {
    throw new Error('cannot parse DATABASE_URL');
    process.exit(1);
  }

  dbConfig = {
    ...dbConfig,
    host: parsed.hostname || '',
    port: parseInt(parsed.port || '0'),
    database: parsed.path && parsed.path.replace('/', ''),
    username: parsed.auth && parsed.auth.split(':')[0],
    password: parsed.auth && parsed.auth.split(':')[1],
  };
}

// The config module determines which config files to load based on NODE_ENV
module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};
