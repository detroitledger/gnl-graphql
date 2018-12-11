import * as config from 'config';

import * as express from 'express';

import { OAuth2Client } from 'google-auth-library';

import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import {
  resolver,
  attributeFields,
  defaultArgs,
  defaultListArgs,
} from 'graphql-sequelize';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { logger } from './logger';

import dbFactory, * as models from './db/models';

// Initalize database
const db = dbFactory() as models.Db;

const orderByMultiResolver = (opts, args) => {
  const options = {
    order: [],
    ...opts,
  };

  if (args.orderByMulti) {
    options.order = options.order.concat(args.orderByMulti);
  }

  return options;
};

const organizationNameILikeResolver = (opts, args) => {
  if (args.organizationNameILike)
    opts.include = [
      {
        required: true,
        model: db.Organization,
        where: {
          name: { [db.sequelize.Op.iLike]: args.organizationNameILike },
        },
      },
    ];
  return opts;
};

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const shallowOrganizationType = new GraphQLObjectType({
  name: 'ShallowOrganization',
  description: 'An organization, without grants funded or received',
  fields: attributeFields(db.Organization, { exclude: ['id'] }),
});

const grantTagType = new GraphQLObjectType({
  name: 'GrantTag',
  description: 'Tag associated with a grant',
  fields: attributeFields(db.GrantTag, { exclude: ['id'] }),
});

const nteeGrantTypeType = new GraphQLObjectType({
  name: 'NteeGrantType',
  description: 'NTEE classification of a grant',
  fields: attributeFields(db.NteeGrantType, { exclude: ['id'] }),
});

const organizationTagType = new GraphQLObjectType({
  name: 'OrganizationTag',
  description: 'Tag associated with an organization',
  fields: attributeFields(db.OrganizationTag, { exclude: ['id'] }),
});

const nteeOrganizationTypeType = new GraphQLObjectType({
  name: 'NteeOrganizationType',
  description: 'NTEE classification of an organization',
  fields: attributeFields(db.NteeOrganizationType, { exclude: ['id'] }),
});

const grantType = new GraphQLObjectType({
  name: 'Grant',
  description: 'A grant, duh',
  fields: {
    ...attributeFields(db.Grant, { exclude: ['id'] }),
    from: {
      type: shallowOrganizationType,
      // @ts-ignore
      resolve: resolver(db.Grant.Funder),
    },
    to: {
      type: shallowOrganizationType,
      // @ts-ignore
      resolve: resolver(db.Grant.Recipient),
    },
    nteeGrantTypes: {
      type: new GraphQLList(nteeGrantTypeType),
      // @ts-ignore
      resolve: resolver(db.Grant.NteeGrantTypes),
    },
    grantTags: {
      type: new GraphQLList(grantTagType),
      // @ts-ignore
      resolve: resolver(db.Grant.GrantTags),
    },
    amount: { type: GraphQLBigInt },
  },
});

const form990Type = new GraphQLObjectType({
  name: 'Form990',
  description: 'One row from the IRS combined table',
  fields: attributeFields(db.Form990),
});

const organizationType = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization, duh',
  fields: {
    ...attributeFields(db.Organization, { exclude: ['id'] }),
    grantsFunded: {
      type: new GraphQLList(grantType),
      // @ts-ignore
      resolve: resolver(db.Organization.GrantsFunded),
    },
    grantsReceived: {
      type: new GraphQLList(grantType),
      // @ts-ignore
      resolve: resolver(db.Organization.GrantsReceived),
    },
    forms990: {
      type: new GraphQLList(form990Type),
      // @ts-ignore
      resolve: resolver(db.Organization.Forms990),
    },
    nteeOrganizationTypes: {
      type: new GraphQLList(nteeOrganizationTypeType),
      // @ts-ignore
      resolve: resolver(db.Organization.NteeOrganizationTypes),
    },
    organizationTags: {
      type: new GraphQLList(organizationTagType),
      // @ts-ignore
      resolve: resolver(db.Organization.OrganizationTags),
    },
  },
});

const organizationMetaType = new GraphQLObjectType({
  name: 'OrganizationMeta',
  description: 'Extra org info',
  fields: {
    ...attributeFields(db.OrganizationMeta, { exclude: ['id'] }),
    organization: {
      type: organizationType,
      // @ts-ignore
      resolve: resolver(db.OrganizationMeta.Organization),
    },
  },
});

const server = new GraphQLServer({
  schema: new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        stats: {
          type: new GraphQLObjectType({
            name: 'Stats',
            description: 'gnl stats',
            fields: {
              total_num_grants: { type: GraphQLInt },
              total_num_orgs: { type: GraphQLInt },
              total_grants_dollars: { type: GraphQLBigInt },
            },
          }),
          resolve: async () => {
            const results = await Promise.all(
              [
                'SELECT COUNT(id) AS total_num_grants FROM "grant"',
                'SELECT COUNT(id) AS total_num_orgs FROM organization',
                'SELECT SUM(amount) AS total_grants_dollars FROM "grant"',
              ].map(q =>
                db.sequelize.query(q, { type: db.Sequelize.QueryTypes.SELECT })
              )
            );

            return results.reduce((acc, cur) => ({ ...acc, ...cur[0] }), {});
          },
        },
        organization: {
          type: organizationType,
          args: defaultArgs({
            ...db.Organization,
            primaryKeyAttributes: ['uuid'],
          }),
          resolve: resolver(db.Organization),
        },
        organizations: {
          type: new GraphQLList(organizationType),
          args: {
            ...defaultListArgs(),
            ...defaultArgs(db.Organization),
            orderByMulti: {
              type: new GraphQLList(new GraphQLList(GraphQLString)),
            },
          },
          resolve: resolver(db.Organization, {
            before: orderByMultiResolver,
          }),
        },
        organizationMetas: {
          type: new GraphQLList(organizationMetaType),
          args: {
            ...defaultListArgs(),
            ...defaultArgs(db.OrganizationMeta),
            orderByMulti: {
              type: new GraphQLList(new GraphQLList(GraphQLString)),
            },
            organizationNameILike: {
              type: GraphQLString,
            },
          },
          resolve: resolver(db.OrganizationMeta, {
            before: (opts, args) => {
              return organizationNameILikeResolver(
                orderByMultiResolver(opts, args),
                args
              );
            },
          }),
        },
        grant: {
          type: grantType,
          args: defaultArgs({
            ...db.Grant,
            primaryKeyAttributes: ['uuid'],
          }),
          resolve: resolver(db.Grant),
        },
        grants: {
          type: new GraphQLList(grantType),
          args: {
            ...defaultListArgs(),
            ...defaultArgs(db.Grant),
          },
          resolve: resolver(db.Grant),
        },
      },
    }),
  }),
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

server.start(
  {
    port: config.get('port'),
  },
  () => {
    console.log('Server is running on localhost');
  }
);
