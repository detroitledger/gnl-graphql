import * as config from 'config';

import * as express from 'express';

import { OAuth2Client } from 'google-auth-library';

import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver, attributeFields } from 'graphql-sequelize';

import { logger } from './logger';

import dbFactory, * as models from './db/models';

// Initalize database
const db = dbFactory() as models.Db;

// Define GraphQL types
const typeDefs = `
  type Query {
    organization(uuid: ID!): Organization
    organizations(limit: Int, offset: Int): [Organization]
    organizationMeta(uuid: ID!): OrganizationMeta
    organizationMetas(limit: Int, offset: Int): [OrganizationMeta]
    grant(uuid: ID!): Grant
    grants(limit: Int): [Grant]
  }

  type Organization {
    uuid: ID!
    name: String
    description: String
    grantsFunded: [Grant]
    grantsReceived: [Grant]
  }

  type OrganizationMeta {
    uuid: ID!
    totalReceived: Int
    totalFunded: Int
    organization: Organization
  }

  type Grant {
    uuid: ID!
    from: Organization
    to: Organization
    amount: Int
    source: String
  }
`;

const resolvers = {
  Query: {
    organization: resolver(db.Organization),
    organizations: resolver(db.Organization),
    organizationMeta: resolver(db.OrganizationMeta),
    organizationMetas: resolver(db.OrganizationMeta),
    grant: resolver(db.Grant),
    grants: resolver(db.Grant),
  },
  Organization: {
    // @ts-ignore
    grantsFunded: resolver(db.Organization.GrantsFunded),
    // @ts-ignore
    grantsReceived: resolver(db.Organization.GrantsReceived),
  },
  OrganizationMeta: {
    // @ts-ignore
    organization: resolver(db.OrganizationMeta.Organization),
  },
  Grant: {
    // @ts-ignore
    from: resolver(db.Grant.Funder),
    // @ts-ignore
    to: resolver(db.Grant.Recipient),
  },
};

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context(req) {
    // For each request, create a DataLoader context for Sequelize to use
    const dataloaderContext = createContext(db.sequelize);

    // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
    // in the global request context
    return {
      [EXPECTED_OPTIONS_KEY]: dataloaderContext,
    };
  },
});

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

server.start(
  {
    port: config.get('port'),
  },
  () => {
    console.log('Server is running on localhost');
  }
);
