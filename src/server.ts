import * as Sequelize from 'sequelize';
import * as decamelize from 'decamelize';
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
  GraphQLEnumType,
} from 'graphql';

import { escape } from 'sequelize/lib/sql-string';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './db/models';

const MAX_LIMIT = 100;

const organizationSpecialFields = {
  countGrantsFrom: {
    type: GraphQLInt,
    resolve: (a, b, c, d, e, f, g) => {
      debugger;
    },
  },
  countGrantsTo: { type: GraphQLInt },
  countDistinctFunders: { type: GraphQLInt },
  countDistinctRecipients: { type: GraphQLInt },
  totalReceived: { type: GraphQLBigInt },
  totalFunded: { type: GraphQLBigInt },
  grantdatesStart: { type: GraphQLString },
  grantdatesEnd: { type: GraphQLString },
};

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
  const nteeGrantTypeArgs = ledgerListArgs(db.NteeGrantType, ['total']);
  const nteeOrganizationTypeArgs = ledgerListArgs(db.NteeOrganizationType, [
    'totalFunded',
    'totalReceived',
  ]);
  const organizationTagArgs = ledgerListArgs(db.OrganizationTag, [
    'totalFunded',
    'totalReceived',
  ]);
  const organizationArgs = ledgerListArgs(
    db.Organization,
    Object.keys(organizationSpecialFields)
  );

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
      total: { type: GraphQLBigInt },
    },
  });

  const nteeGrantTypeType = new GraphQLObjectType({
    name: 'NteeGrantType',
    description: 'NTEE classification of a grant',
    fields: {
      ...attributeFields(db.NteeGrantType, { exclude: ['id'] }),
      total: { type: GraphQLBigInt },
    },
  });

  const nteeOrganizationTypeType = new GraphQLObjectType({
    name: 'NteeOrganizationType',
    description: 'NTEE classification of an organization',
    fields: {
      ...attributeFields(db.NteeOrganizationType, { exclude: ['id'] }),
      totalFunded: { type: GraphQLBigInt },
      totalReceived: { type: GraphQLBigInt },
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
        resolve: organizationResolver(db),
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
        resolve: organizationResolver(db, opts => opts.get('from')),
      },
      to: {
        type: shallowOrganizationType,
        args: organizationArgs,
        resolve: organizationResolver(db, opts => opts.get('to')),
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
          undefined,
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
            args: organizationArgs,
            resolve: organizationResolver(db),
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

interface OrganizationIdDeducer {
  (opts: any): number;
}

// Add a join to the organization query
interface OrganizationAddJoin {
  (opts: any): string;
}

const organizationResolver = (
  db,
  orgIdDeducer?: OrganizationIdDeducer,
  orgAddJoin?: OrganizationAddJoin
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
) => {
  let where = '';
  if (uuid) {
    where = `WHERE o.uuid = ${escape(uuid)}`;
  } else if (opts && orgIdDeducer) {
    where = `WHERE o.id = ${orgIdDeducer(opts)}`;
  }

  let addedJoin = '';
  if (opts && orgAddJoin) {
    addedJoin = orgAddJoin(opts);
  }

  const metaCols = Object.keys(organizationSpecialFields).map(
    col => `om.${decamelize(col)} AS "${col}"`
  );

  const results = await db.sequelize.query(
    `SELECT o.*, ${metaCols.join(',')}
FROM organization o
LEFT JOIN organization_meta om ON o.id=om.id
${addedJoin}
${where}
ORDER BY "${orderBy}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.Organization,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return orgIdDeducer ? results[0] : results;
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

const nteeOrganizationTypeResolver = (
  db,
  resolverOpts: OrganizationTagResolverOptions = defaultOrganizationTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
) => {
  let where = '';
  // Fetching only organization tags related to a specific organization
  if (resolverOpts.limitToOrganizationId) {
    where = `WHERE oot.organization_id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE ot.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `SELECT ot.id, ot.uuid, ot.name, ot.code, ot.description, SUM(gf.amount) as "totalFunded", SUM(gr.amount) as "totalReceived"
FROM ntee_organization_type ot
LEFT JOIN organization_ntee_organization_type oot ON ot.id=oot.ntee_organization_type_id
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

const nteeGrantTypeResolver = (
  db,
  resolverOpts: GrantTagResolverOptions = defaultGrantTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
) => {
  let where = '';
  // Fetching only grant tags related to a specific grant
  if (resolverOpts.limitToGrantId) {
    where = `WHERE g.id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE gt.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `SELECT gt.id, gt.uuid, gt.name, gt.code, gt.description, SUM(g.amount) as total
FROM ntee_grant_type gt
LEFT JOIN grant_ntee_grant_type ggt ON gt.id=ggt.ntee_grant_type_id
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
    defaultValue: 'id',
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
    defaultValue: 'ASC NULLS LAST',
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
