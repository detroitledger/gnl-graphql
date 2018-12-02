import * as config from 'config';

import * as express from 'express';

import * as cors from 'cors';

import { postgraphile } from 'postgraphile';

import { OAuth2Client } from 'google-auth-library';

// add cors to fix 'access-control-allow-origin' error when connecting apollo graphql client app
const server = express().use('*', cors());

server.use(
  postgraphile(process.env.DATABASE_URL || 'postgres:///', 'public', {
    graphiql: true,
  })
);

// Auth
if (!config.get('google.client_id')) {
  throw new Error(
    'GOOGLE_CLIENT_ID environment variable is required to start.'
  );
}

const client = new OAuth2Client(config.get('google.client_id'));

async function verifyToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.get('google.client_id'),
  });
  const payload = ticket.getPayload();
  return payload;
}

const authenticateGoogleUser = user =>
  config
    .get('auth.allowed_emails')
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

server.use(
  '/getGoogleUser',
  authenticatedOnly((req, res) => {
    res.status(200).json({ user: req.user });
  })
);

server.listen(config.get('port'), () =>
  console.log(`Server is now running on http://localhost:${process.env.PORT}/`)
);
