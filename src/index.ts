import * as config from 'config';
import * as path from 'path';
import * as express from 'express';
import * as cors from 'cors';

import { OAuth2Client } from 'google-auth-library';

import { authenticatedOnly } from './auth';

import createServer from './server';
import dbFactory, * as models from './db/models';

const oauthClient = new OAuth2Client(config.get('google.client_id'));

// Initalize database
const db = dbFactory() as models.Db;

// Our own little CORS config
const corsConfig = {
  origin: true,
  credentials: true,
};

const server = createServer(db, oauthClient);

// Auth
if (!config.get('google.client_id')) {
  console.error(
    'GOOGLE_CLIENT_ID environment variable is required to serve authenticated endpoints'
  );
  process.exit(1);
}

server.express.use(
  '/getGoogleUser',
  cors(corsConfig),
  authenticatedOnly(
    (req, res) => {
      res.status(200).json({ user: req.user });
    },
    oauthClient,
    db
  )
);

// CSV exports
server.express.use(
  '/exports/csv',
  express.static(path.resolve(__dirname, 'csv-exports'))
);

server.start(
  {
    port: config.get('port'),
    cors: corsConfig,
  },
  () => {
    console.log('Server is running on localhost');
  }
);
