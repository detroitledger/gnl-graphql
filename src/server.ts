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
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} from 'graphql';

import { OAuth2Client } from 'google-auth-library';

import { escape } from 'sequelize/lib/sql-string';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './db/models';

import { getTokenFromReq, getUserFromToken } from './auth';

import {
  organizationResolver,
  organizationArgs,
  organizationSpecialFields,
  singleOrganizationResolver,
  createGetOrganizationByIdDataloader,
  createGetOrganizationByUuidDataloader,
  OrganizationAttributes,
} from './db/models/organization';
import { grantResolver, grantArgs, GrantAttributes } from './db/models/grant';
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
import { pdfResolver, pdfArgs } from './db/models/pdf';
import {
  singleUserResolver,
  createGetUserByIdDataloader,
  createGetUserByUuidDataloader,
} from './db/models/user';

export default function createServer(
  db: Db,
  oauthClient: OAuth2Client
): GraphQLServer {
  resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

  // Types
  const form990Type = new GraphQLObjectType({
    name: 'Form990',
    description: 'One row from the IRS combined table',
    fields: attributeFields(db.Form990),
  });

  const shallowOrganizationType = new GraphQLObjectType({
    name: 'ShallowOrganization',
    description: 'An organization, without grants funded or received',
    fields: {
      ...attributeFields(db.Organization, { exclude: ['id'] }),
      forms990: {
        type: new GraphQLList(form990Type),
        // @ts-ignore
        resolve: resolver(db.Organization.Forms990),
      },
    },
  });

  const shallowGrantType = new GraphQLObjectType({
    name: 'ShallowGrant',
    description: 'A grant, without tags or related org grants',
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
      amount: { type: GraphQLBigInt },
    },
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

  const shallowNteeOrganizationTypeType = new GraphQLObjectType({
    name: 'ShallowNteeOrganizationType',
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
        resolve: grantTagResolver(db, {
          limitToGrantId: true,
          limitToOrganizationId: false,
        }),
      },
      amount: { type: GraphQLBigInt },
      relatedFrom: {
        type: new GraphQLList(shallowGrantType),
        args: grantArgs,
        resolve: grantResolver(db, opts => `g.from=${opts.get('from')}`),
      },
      relatedTo: {
        type: new GraphQLList(shallowGrantType),
        args: grantArgs,
        resolve: grantResolver(db, opts => `g.to=${opts.get('to')}`),
      },
    },
  });

  const grantInputType = new GraphQLInputObjectType({
    name: 'GrantInput',
    fields: {
      ...attributeFields(db.Grant, {
        exclude: ['id', 'uuid', 'created_at', 'updated_at'],
      }),
      from: { type: GraphQLString },
      to: { type: GraphQLString },
      amount: { type: GraphQLString }, // Ideally this would be GraphQLBigInt but it doesn't seem to work w/ mutation!
    },
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
        type: new GraphQLList(shallowNteeOrganizationTypeType),
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
      organizationGrantTags: {
        type: new GraphQLList(grantTagType),
        args: grantTagArgs,
        resolve: grantTagResolver(db, {
          limitToGrantId: false,
          limitToOrganizationId: true,
        }),
      },
    },
  });

  const nteeOrganizationTypeType = new GraphQLObjectType({
    name: 'NteeOrganizationType',
    description:
      'NTEE classification of an organization, with related organizations',
    fields: {
      ...attributeFields(db.NteeOrganizationType, { exclude: ['id'] }),
      ...nteeOrganizationTypeSpecialFields,
      organizations: {
        type: new GraphQLList(shallowOrganizationType),
        args: organizationArgs,
        resolve: organizationResolver(
          db,
          opts => `
INNER JOIN organization_ntee_organization_type onot
  ON o.id=onot.organization_id
INNER JOIN ntee_organization_type n_o_t
  ON n_o_t.id=onot.ntee_organization_type_id AND n_o_t.id=${opts.id}
`
        ),
      },
    },
  });

  const organizationInputType = new GraphQLInputObjectType({
    name: 'OrganizationInput',
    fields: attributeFields(db.Organization, {
      exclude: ['id', 'uuid', 'created_at', 'updated_at'],
    }),
  });

  const userType = new GraphQLObjectType({
    name: 'User',
    description: 'Someone who manages data',
    fields: attributeFields(db.User, { exclude: ['id'] }),
  });

  const pdfType = new GraphQLObjectType({
    name: 'Pdf',
    description:
      'A PDF containing records related to an organization for a certain year (probably an IRS Form 990)',
    fields: {
      ...attributeFields(db.Pdf, { exclude: ['id'] }),
      organization: {
        type: shallowOrganizationType,
        args: organizationArgs,
        resolve: singleOrganizationResolver(opts => opts.get('organization')),
      },
      user: {
        type: userType,
        resolve: singleUserResolver(opts => opts.get('user')),
      },
    },
  });

  const pdfInputType = new GraphQLInputObjectType({
    name: 'PdfInput',
    fields: {
      ...attributeFields(db.Pdf, {
        exclude: ['id', 'uuid', 'created_at', 'updated_at'],
      }),
      user: { type: GraphQLString },
      organization: { type: GraphQLString },
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
                  'SELECT COUNT(id) AS total_num_grants FROM "grant"',
                  'SELECT COUNT(id) AS total_num_orgs FROM organization',
                  'SELECT SUM(amount) AS total_grants_dollars FROM "grant"',
                ].map(q =>
                  db.sequelize.query(q, {
                    type: db.Sequelize.QueryTypes.SELECT,
                  })
                )
              );

              return {
                totalNumGrants: results[0][0].total_num_grants,
                totalNumOrgs: results[1][0].total_num_orgs,
                totalGrantsDollars: results[2][0].total_grants_dollars,
              };
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
          pdf: {
            type: pdfType,
            args: defaultArgs({
              ...db.Pdf,
              primaryKeyAttributes: ['id', 'uuid'],
            }),
            resolve: resolver(db.Pdf),
          },
          pdfs: {
            type: new GraphQLList(pdfType),
            args: pdfArgs,
            resolve: pdfResolver(db),
          },
          users: {
            type: new GraphQLList(userType),
            resolve: resolver(db.User),
          },
        },
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
          addOrganization: {
            type: organizationType,
            args: {
              input: { type: new GraphQLNonNull(organizationInputType) },
            },
            resolve: async (source, { input }, context) => {
              const authenticatedUser = await getUserFromToken(
                context.token,
                context.oauthClient,
                db
              );

              if (!authenticatedUser) {
                throw new Error('not authenticated');
              }

              const newOrg = await db.Organization.create(input);
              return context.dataloader_sequelize_context.loaders.Organization.byId.load(
                newOrg.id
              );
            },
          },
          addGrant: {
            type: grantType,
            args: { input: { type: new GraphQLNonNull(grantInputType) } },
            resolve: async (source, { input }, context) => {
              const authenticatedUser = await getUserFromToken(
                context.token,
                context.oauthClient,
                db
              );

              if (!authenticatedUser) {
                throw new Error('not authenticated');
              }

              const from = await db.Organization.find({
                where: { uuid: input.from },
              });
              const to = await db.Organization.find({
                where: { uuid: input.to },
              });

              const newGrant = await db.Grant.create({
                ...input,
                from: from!.id,
                to: to!.id,
              });
              return context.dataloader_sequelize_context.loaders.Grant.byId.load(
                newGrant.id
              );
            },
          },
          addPdf: {
            type: pdfType,
            args: { input: { type: new GraphQLNonNull(pdfInputType) } },
            resolve: async (source, { input }, context) => {
              const authenticatedUser = await getUserFromToken(
                context.token,
                context.oauthClient,
                db
              );

              if (!authenticatedUser) throw new Error('not authenticated');

              const organization = await db.Organization.find({
                where: { uuid: input.organization },
              });

              if (!organization) throw new Error('missing organization');

              const user = await db.User.find({
                where: { uuid: input.user },
              });

              const newPdf = await db.Pdf.create({
                ...input,
                organization: organization!.id,
                user: user ? user!.id : null,
              });

              return context.dataloader_sequelize_context.loaders.Pdf.byId.load(
                newPdf.id
              );
            },
          },
        }),
      }),
    }),
    context: function context(ctx) {
      // For each request, create a DataLoader context for Sequelize to use
      const dataloaderContext = createContext(db.sequelize);
      const getOrganizationById = createGetOrganizationByIdDataloader(db);
      const getOrganizationByUuid = createGetOrganizationByUuidDataloader(db);
      const getUserById = createGetUserByIdDataloader(db);
      const getUserByUuid = createGetUserByUuidDataloader(db);

      const token = getTokenFromReq(ctx.request);

      // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
      // in the global request context
      return {
        [EXPECTED_OPTIONS_KEY]: dataloaderContext,
        getOrganizationById,
        getOrganizationByUuid,
        getUserById,
        getUserByUuid,
        token,
        oauthClient,
      };
    },
  });
}
