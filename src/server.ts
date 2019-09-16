import * as Sequelize from 'sequelize';
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
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import { escape } from 'sequelize/lib/sql-string';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './db/models';

import {
  organizationResolver,
  organizationArgs,
  organizationSpecialFields,
  singleOrganizationResolver,
  createGetOrganizationByIdDataloader,
  createGetOrganizationByUuidDataloader,
} from './db/models/organization';
import { grantResolver, grantArgs } from './db/models/grant';
import {
  grantTagResolver,
  grantTagArgs,
  grantTagSpecialFields,
} from './db/models/grantTag';
import {
  organizationTagResolver,
  organizationTagArgs,
  organizationTagSpecialFields,
} from './db/models/organizationTag';
import {
  nteeGrantTypeResolver,
  nteeGrantTypeArgs,
  nteeGrantTypeSpecialFields,
} from './db/models/nteeGrantType';
import {
  nteeOrganizationTypeResolver,
  nteeOrganizationTypeArgs,
  nteeOrganizationTypeSpecialFields,
} from './db/models/nteeOrganizationType';

export default function createServer(db: Db): GraphQLServer {
  resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

  // Types
  const shallowOrganizationType = new GraphQLObjectType({
    name: 'ShallowOrganization',
    description: 'An organization, without grants funded or received',
    fields: attributeFields(db.Organization, { exclude: ['id'] }),
  });

  const organizationTagType = new GraphQLObjectType({
    name: 'OrganizationTag',
    description: 'Tag associated with an organization',
    fields: {
      ...attributeFields(db.OrganizationTag, { exclude: ['id'] }),
      ...organizationTagSpecialFields,
    },
  });

  const grantTagType = new GraphQLObjectType({
    name: 'GrantTag',
    description: 'Tag associated with a grant',
    fields: {
      ...attributeFields(db.GrantTag, { exclude: ['id'] }),
      ...grantTagSpecialFields,
    },
  });

  const nteeGrantTypeType = new GraphQLObjectType({
    name: 'NteeGrantType',
    description: 'NTEE classification of a grant',
    fields: {
      ...attributeFields(db.NteeGrantType, { exclude: ['id'] }),
      ...nteeGrantTypeSpecialFields,
    },
  });

  const nteeOrganizationTypeType = new GraphQLObjectType({
    name: 'NteeOrganizationType',
    description: 'NTEE classification of an organization',
    fields: {
      ...attributeFields(db.NteeOrganizationType, { exclude: ['id'] }),
      ...nteeOrganizationTypeSpecialFields,
    },
  });

  const personType = new GraphQLObjectType({
    name: 'Person',
    description: 'A person related to organizations through board terms',
    fields: attributeFields(db.Person, { exclude: ['id'] }),
  });

  const boardTermType = new GraphQLObjectType({
    name: 'BoardTerm',
    description:
      'A board term represents time spent by a person serving on the board of an organization',
    fields: {
      ...attributeFields(db.BoardTerm, { exclude: ['id'] }),
      person: {
        type: personType,
        // @ts-ignore
        resolve: resolver(db.BoardTerm.Person),
      },
      organization: {
        type: shallowOrganizationType,
        args: organizationArgs,
        resolve: singleOrganizationResolver(),
      },
    },
  });

  const grantType = new GraphQLObjectType({
    name: 'Grant',
    description: 'A grant, duh',
    fields: {
      ...attributeFields(db.Grant, { exclude: ['id'] }),
      from: {
        type: shallowOrganizationType,
        args: organizationArgs,
        resolve: singleOrganizationResolver(opts => opts.get('from')),
      },
      to: {
        type: shallowOrganizationType,
        args: organizationArgs,
        resolve: singleOrganizationResolver(opts => opts.get('to')),
      },
      nteeGrantTypes: {
        type: new GraphQLList(nteeGrantTypeType),
        args: nteeGrantTypeArgs,
        resolve: nteeGrantTypeResolver(db, { limitToGrantId: true }),
      },
      grantTags: {
        type: new GraphQLList(grantTagType),
        args: grantTagArgs,
        resolve: grantTagResolver(db, { limitToGrantId: true }),
      },
      amount: { type: GraphQLBigInt },
    },
  });

  const form990Type = new GraphQLObjectType({
    name: 'Form990',
    description: 'One row from the IRS combined table',
    fields: attributeFields(db.Form990),
  });

  const newsType = new GraphQLObjectType({
    name: 'News',
    description: 'News related to one or many organizations',
    fields: {
      ...attributeFields(db.News, { exclude: ['id'] }),
      organizations: {
        type: new GraphQLList(shallowOrganizationType),
        args: organizationArgs,
        resolve: organizationResolver(
          db,
          opts =>
            `INNER JOIN news_organizations no ON no.news_id=${
              opts.id
            } AND no.organization_id=o.id`
        ),
      },
      grants: {
        type: new GraphQLList(grantType),
        // @ts-ignore
        resolve: resolver(db.News.Grants),
      },
    },
  });

  const organizationType = new GraphQLObjectType({
    name: 'Organization',
    description: 'An organization, duh',
    fields: {
      ...attributeFields(db.Organization, { exclude: ['id'] }),
      ...organizationSpecialFields,
      boardTerms: {
        type: new GraphQLList(boardTermType),
        // @ts-ignore
        resolve: resolver(db.Organization.BoardTerms),
      },
      grantsFunded: {
        type: new GraphQLList(grantType),
        args: grantArgs,
        resolve: grantResolver(db, opts => `g.from=${opts.get('id')}`),
      },
      grantsReceived: {
        type: new GraphQLList(grantType),
        args: grantArgs,
        resolve: grantResolver(db, opts => `g.to=${opts.get('id')}`),
      },
      forms990: {
        type: new GraphQLList(form990Type),
        // @ts-ignore
        resolve: resolver(db.Organization.Forms990),
      },
      news: {
        type: new GraphQLList(newsType),
        // @ts-ignore
        resolve: resolver(db.Organization.News),
      },
      nteeOrganizationTypes: {
        type: new GraphQLList(nteeOrganizationTypeType),
        args: nteeOrganizationTypeArgs,
        resolve: nteeOrganizationTypeResolver(db, {
          limitToOrganizationId: true,
        }),
      },
      organizationTags: {
        type: new GraphQLList(organizationTagType),
        args: organizationTagArgs,
        resolve: organizationTagResolver(db, { limitToOrganizationId: true }),
      },
    },
  });

  return new GraphQLServer({
    schema: new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          stats: {
            type: new GraphQLObjectType({
              name: 'Stats',
              description: 'gnl stats',
              fields: {
                totalNumGrants: { type: GraphQLInt },
                totalNumOrgs: { type: GraphQLInt },
                totalGrantsDollars: { type: GraphQLBigInt },
              },
            }),
            resolve: async () => {
              const results = await Promise.all(
                [
                  'SELECT COUNT(id) AS totalNumGrants FROM "grant"',
                  'SELECT COUNT(id) AS totalNumOrgs FROM organization',
                  'SELECT SUM(amount) AS totalGrantsDollars FROM "grant"',
                ].map(q =>
                  db.sequelize.query(q, {
                    type: db.Sequelize.QueryTypes.SELECT,
                  })
                )
              );

              return results.reduce((acc, cur) => ({ ...acc, ...cur[0] }), {});
            },
          },
          organization: {
            type: organizationType,
            args: defaultArgs({
              ...db.Organization,
              primaryKeyAttributes: ['id', 'uuid'],
            }),
            resolve: singleOrganizationResolver(),
          },
          news: {
            type: new GraphQLList(newsType),
            args: {
              ...defaultListArgs(),
              ...defaultArgs(db.News),
            },
            resolve: resolver(db.News),
          },
          organizations: {
            type: new GraphQLList(organizationType),
            args: organizationArgs,
            resolve: organizationResolver(db),
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
          nteeOrganizationTypes: {
            type: new GraphQLList(nteeOrganizationTypeType),
            args: nteeOrganizationTypeArgs,
            resolve: nteeOrganizationTypeResolver(db),
          },
          organizationTags: {
            type: new GraphQLList(organizationTagType),
            args: organizationTagArgs,
            resolve: organizationTagResolver(db),
          },
          nteeGrantTypes: {
            type: new GraphQLList(nteeGrantTypeType),
            args: nteeGrantTypeArgs,
            resolve: nteeGrantTypeResolver(db),
          },
          grantTags: {
            type: new GraphQLList(grantTagType),
            args: grantTagArgs,
            resolve: grantTagResolver(db),
          },
        },
      }),
    }),
    context(req) {
      // For each request, create a DataLoader context for Sequelize to use
      const dataloaderContext = createContext(db.sequelize);
      const getOrganizationById = createGetOrganizationByIdDataloader(db);
      const getOrganizationByUuid = createGetOrganizationByUuidDataloader(db);

      // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
      // in the global request context
      return {
        [EXPECTED_OPTIONS_KEY]: dataloaderContext,
        getOrganizationById,
        getOrganizationByUuid,
      };
    },
  });
}
