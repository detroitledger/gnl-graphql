import * as Sequelize from 'sequelize';
import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import {
  resolver,
  attributeFields,
  defaultArgs,
  defaultListArgs,
  simplifyAST,
} from 'graphql-sequelize';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType,
} from 'graphql';

import { escape } from 'sequelize/lib/sql-string';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './db/models';

const MAX_LIMIT = 100;

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

  // Arguments
  const grantTagArgs = ledgerListArgs(db.GrantTag, ['total']);
  const organizationTagArgs = ledgerListArgs(db.OrganizationTag, [
    'totalFunded',
    'totalReceived',
  ]);

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
      totalFunded: { type: GraphQLBigInt },
      totalReceived: { type: GraphQLBigInt },
    },
  });

  const grantTagType = new GraphQLObjectType({
    name: 'GrantTag',
    description: 'Tag associated with a grant',
    fields: {
      ...attributeFields(db.GrantTag, { exclude: ['id'] }),
      total: {
        type: GraphQLBigInt,
        //resolve: source => source.dataValues.total,
      },
    },
  });

  const nteeGrantTypeType = new GraphQLObjectType({
    name: 'NteeGrantType',
    description: 'NTEE classification of a grant',
    fields: attributeFields(db.NteeGrantType, { exclude: ['id'] }),
  });

  const nteeOrganizationTypeType = new GraphQLObjectType({
    name: 'NteeOrganizationType',
    description: 'NTEE classification of an organization',
    fields: attributeFields(db.NteeOrganizationType, { exclude: ['id'] }),
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
        // @ts-ignore
        resolve: resolver(db.BoardTerm.Organization),
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
      boardTerms: {
        type: new GraphQLList(boardTermType),
        // @ts-ignore
        resolve: resolver(db.Organization.BoardTerms),
      },
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
        args: organizationTagArgs,
        resolve: organizationTagResolver(db, { limitToOrganizationId: true }),
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
          organizationTags: {
            type: new GraphQLList(organizationTagType),
            args: organizationTagArgs,
            resolve: organizationTagResolver(db),
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

      // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
      // in the global request context
      return {
        [EXPECTED_OPTIONS_KEY]: dataloaderContext,
      };
    },
  });
}

interface OrganizationTagResolverOptions {
  limitToOrganizationId: boolean;
}

const defaultOrganizationTagResolverOptions = {
  limitToOrganizationId: false,
};

interface GrantTagResolverOptions {
  limitToGrantId: boolean;
}

const defaultGrantTagResolverOptions = {
  limitToGrantId: false,
};

const organizationTagResolver = (
  db,
  resolverOpts: OrganizationTagResolverOptions = defaultOrganizationTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
) => {
  const { fieldNodes } = info;
  const ast = simplifyAST(fieldNodes[0], info);

  let where = '';
  // Fetching only organization tags related to a specific organization
  if (resolverOpts.limitToOrganizationId) {
    where = `WHERE oot.organization_id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE ot.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `SELECT ot.id, ot.uuid, ot.name, ot.description, SUM(gf.amount) as "totalFunded", SUM(gr.amount) as "totalReceived"
FROM organization_tag ot
LEFT JOIN organization_organization_tag oot ON ot.id=oot.organization_tag_id
LEFT JOIN "grant" gf ON gf.from=oot.organization_id
LEFT JOIN "grant" gr ON gr.to=oot.organization_id
${where}
GROUP BY ot.id
ORDER BY "${orderBy}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};

const grantTagResolver = (
  db,
  resolverOpts: GrantTagResolverOptions = defaultGrantTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
) => {
  const { fieldNodes } = info;
  const ast = simplifyAST(fieldNodes[0], info);

  let where = '';
  // Fetching only grant tags related to a specific grant
  if (resolverOpts.limitToGrantId) {
    where = `WHERE g.id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE gt.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `SELECT gt.id, gt.uuid, gt.name, gt.description, SUM(g.amount) as total
FROM grant_tag gt
LEFT JOIN grant_grant_tag ggt ON gt.id=ggt.grant_tag_id
LEFT JOIN "grant" g ON ggt.grant_id=g.id
${where}
GROUP BY gt.id
ORDER BY "${orderBy}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};

const ledgerListArgs = (
  model: Sequelize.Model<any, any>,
  orderBySpecialCols: string[]
) => ({
  orderBy: {
    type: new GraphQLEnumType({
      name: `orderBy${model.name}`,
      // @ts-ignore tableAttributes is not in sequelize type defs
      values: Object.keys(model.tableAttributes).reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: { value: cur },
        }),
        orderBySpecialCols.reduce(
          (acc, cur) => ({
            ...acc,
            [cur]: { value: cur },
          }),
          {}
        )
      ),
    }),
    defaultValue: 'uuid',
    description: 'sort results by given field',
  },
  orderByDirection: {
    type: new GraphQLEnumType({
      name: `orderByDirection${model.name}`,
      values: {
        ASC: { value: 'ASC NULLS LAST' },
        DESC: { value: 'DESC NULLS LAST' },
      },
    }),
    defaultValue: 'DESC NULLS LAST',
    description: 'sort direction',
  },
  limit: {
    type: GraphQLInt,
    defaultValue: 10,
    description: `Number of items to return, maximum ${MAX_LIMIT}`,
  },
  offset: {
    type: GraphQLInt,
    defaultValue: 0,
  },
  uuid: {
    type: GraphQLString,
  },
});
