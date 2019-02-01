import * as Sequelize from 'sequelize';
import * as decamelize from 'decamelize';
import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import * as DataLoader from 'dataloader';
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

import { OrganizationInstance } from './db/models/organization';

const MAX_LIMIT = 100;

const organizationSpecialFields = {
  countGrantsFrom: { type: GraphQLInt },
  countGrantsTo: { type: GraphQLInt },
  countDistinctFunders: { type: GraphQLInt },
  countDistinctRecipients: { type: GraphQLInt },
  totalReceived: { type: GraphQLBigInt },
  totalFunded: { type: GraphQLBigInt },
  grantdatesStart: { type: GraphQLString },
  grantdatesEnd: { type: GraphQLString },
};

export default function createServer(db: Db): GraphQLServer {
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
  const grantArgs = ledgerListArgs(db.Grant);
  const organizationArgs = {
    ...ledgerListArgs(db.Organization, Object.keys(organizationSpecialFields)),
    nameLike: {
      type: GraphQLString,
    },
  };

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
        resolve: grantResolver(db, opts => `WHERE g.from=${opts.get('id')}`),
      },
      grantsReceived: {
        type: new GraphQLList(grantType),
        args: grantArgs,
        resolve: grantResolver(db, opts => `WHERE g.to=${opts.get('id')}`),
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

// Add a join to a organization query
interface AddJoin {
  (opts: any): string;
}

const grantResolver = (db, grantAddWhere?: AddJoin) => async (
  opts,
  { limit, offset, orderBy, orderByDirection },
  context,
  info
) => {
  let where = '';
  if (grantAddWhere) {
    where = grantAddWhere(opts);
  }

  const results = await db.sequelize.query(
    `SELECT g.*
FROM "grant" g
${where}
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.Grant,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};

const metaCols = Object.keys(organizationSpecialFields).map(
  col => `om.${decamelize(col)} AS "${decamelize(col)}"`
);

const createGetOrganizationByIdDataloader = (db: Db) => {
  return new DataLoader(
    async (ids: number[]): Promise<OrganizationInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT o.*, ${metaCols.join(',')}
  FROM organization o
  LEFT JOIN organization_meta om ON o.id=om.id
  WHERE o.id IN(:ids)`,
        {
          type: db.Sequelize.QueryTypes.SELECT,
          model: db.Organization,
          mapToModel: true,
          replacements: { ids },
        }
      );

      const ordered = ids.map(
        id =>
          results.find(o => o.id === id) ||
          new Error(`cannot find organization with id ${id}`)
      );

      return ordered;
    }
  );
};

const createGetOrganizationByUuidDataloader = (db: Db) => {
  return new DataLoader(
    async (uuids: number[]): Promise<OrganizationInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT o.*, ${metaCols.join(',')}
  FROM organization o
  LEFT JOIN organization_meta om ON o.id=om.id
  WHERE o.uuid IN(:uuids)`,
        {
          type: db.Sequelize.QueryTypes.SELECT,
          model: db.Organization,
          mapToModel: true,
          replacements: { uuids },
        }
      );

      const ordered = uuids.map(
        uuid =>
          results.find(o => o.uuid === uuid) ||
          new Error(`cannot find organization with uuid ${uuid}`)
      );

      return ordered;
    }
  );
};

interface GetIdFromOpts {
  (opts: any): number;
}

const singleOrganizationResolver = (getId?: GetIdFromOpts) => async (
  opts,
  args,
  context,
  info
) => {
  if (getId) {
    return context.getOrganizationById.load(getId(opts));
  }

  if (args.id) {
    return context.getOrganizationById.load(args.id);
  }

  if (args.uuid) {
    return context.getOrganizationByUuid.load(args.uuid);
  }
};

const singleGrantResolver = getId => async (opts, args, context, info) => {
  return context.getGrantById.load(getId(opts));
};

const organizationResolver = (db, orgAddJoin?: AddJoin) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, nameLike },
  context,
  info
) => {
  let where = '';
  if (nameLike) {
    where = `WHERE o.name ILIKE ${escape(nameLike)}`;
  }

  let addedJoin = '';
  if (opts && orgAddJoin) {
    addedJoin = orgAddJoin(opts);
  }

  const results = await db.sequelize.query(
    `SELECT o.*, ${metaCols.join(',')}
FROM organization o
LEFT JOIN organization_meta om ON o.id=om.id
${addedJoin}
${where}
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
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

  return results;
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
  orderBySpecialCols: string[] = []
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
  id: {
    type: GraphQLInt,
  },
});
