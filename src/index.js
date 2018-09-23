import * as dotenv from 'dotenv';

import * as express from 'express';

import * as cors from 'cors';

import {
  apolloExpress,
  graphiqlExpress,
} from 'apollo-server';

import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import * as bodyParser from 'body-parser';

import { OAuth2Client } from 'google-auth-library';

import Schema from './data/schema';
//import Mocks from './data/mocks';
import Resolvers from './data/resolvers';
import {
  IrsDbConnector,
  LedgerConnector,
} from './data/connectors';

dotenv.config();

// add cors to fix 'access-control-allow-origin' error when connecting apollo graphql client app
const server = express().use('*', cors());

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
});

//addMockFunctionsToSchema({
//  schema: executableSchema,
//  mocks: Mocks,
//  preserveResolvers: true,
//});

server.use('/graphql', bodyParser.json(), apolloExpress({
  schema: executableSchema,
  context: {
    connectors: {
      IrsDb: new IrsDbConnector(),
      Ledger: new LedgerConnector(),
    },
  },
}));

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

// Auth
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID environment variable is required to start.');
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyToken(idToken) {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

const authenticateGoogleUser = user => process.env.ALLOWED_EMAILS.split(' ').includes(user.email);

server.use('/getGoogleUser', (req, res, next) => {
  if (req.headers['x-auth-token']) {
    try {
      verifyToken(req.headers['x-auth-token'])
        .then((user) => {
          req.user = user;
          if (authenticateGoogleUser(user)) {
            res.status(200).json({ user });
          } else {
            res.status(401).json({ error: 'Not on the list' });
          }
        })
        .catch((e) => {
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
});

server.listen(process.env.GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${process.env.GRAPHQL_PORT}/graphql`
));
