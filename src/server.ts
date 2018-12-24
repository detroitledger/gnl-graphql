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

import { Db } from './db/models';

export default function createServer(db: Db): GraphQLServer {
  const orderByMultiResolver = (opts, args) => {
    const options = {
      order: [],
      ...opts,
    };

    if (args.orderByMulti) {
      options.order = options.order.concat(
        args.orderByMulti.map(arg => [
          arg[0],
          arg[1] === 'ASC' ? 'ASC NULLS LAST' : 'DESC NULLS LAST',
        ])
      );
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

  const newsType = new GraphQLObjectType({
    name: 'News',
    description: 'News related to one or many organizations',
    fields: {
      ...attributeFields(db.News, { exclude: ['id'] }),
      organizations: {
        type: new GraphQLList(shallowOrganizationType),
        // @ts-ignore
        resolve: resolver(db.News.Organizations),
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
      news: {
        type: new GraphQLList(newsType),
        // @ts-ignore
        resolve: resolver(db.Organization.News),
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
              primaryKeyAttributes: ['uuid'],
            }),
            resolve: resolver(db.Organization),
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
}
