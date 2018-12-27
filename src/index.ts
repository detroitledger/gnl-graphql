import * as config from 'config';
import * as path from 'path';
import * as express from 'express';

import { OAuth2Client } from 'google-auth-library';

import createServer from './server';
import dbFactory, * as models from './db/models';

// Initalize database
const db = dbFactory() as models.Db;

const server = createServer(db);

// Auth
if (!config.get('google.client_id')) {
  console.warn(
    'GOOGLE_CLIENT_ID environment variable is required to serve authenticated endpoints'
  );
} else {
  const client = new OAuth2Client(config.get('google.client_id'));

  async function verifyToken(idToken) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.get('google.client_id'),
    });
    const payload = ticket && ticket.getPayload();
    return payload;
  }

  const authenticateGoogleUser = user =>
    config
      .get('auth.allowed_emails')
      .toString()
      .split(' ')
      .includes(user.email);

  const authenticatedOnly = handler => (req, res) => {
    if (req.headers['x-auth-token']) {
      try {
        verifyToken(req.headers['x-auth-token'])
          .then(user => {
            req.user = user;
            if (authenticateGoogleUser(user)) {
              handler(req, res);
            } else {
              res.status(401).json({ error: 'Not on the list' });
            }
          })
          .catch(e => {
            if (e.message && e.message.includes('Token used too late')) {
              res.status(412).json({ error: 'Token expired' });
            } else {
              res.status(401).json({ error: 'Unauthorized' });
            }
          });
      } catch (e) {
        res.status(500).json({ error: 'Unknown error' });
      }
    } else {
      res.status(400).json({ error: 'Missing token' });
    }
  };

  server.express.use(
    '/getGoogleUser',
    authenticatedOnly((req, res) => {
      res.status(200).json({ user: req.user });
    })
  );
}

// CSV exports
server.express.use(
  '/csv-exports',
  express.static(path.resolve(__dirname, 'csv-exports'))
);

server.start(
  {
    port: config.get('port'),
  },
  () => {
    console.log('Server is running on localhost');
  }
);
