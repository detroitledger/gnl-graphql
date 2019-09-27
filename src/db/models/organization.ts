import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';
import * as DataLoader from 'dataloader';
import { attributeFields } from 'graphql-sequelize';

import { Db } from './';

import {
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { ledgerListArgs, specialCols, MAX_LIMIT } from '../../helpers';

import { GrantInstance, GrantAttributes } from './grant';
import { NewsInstance, NewsAttributes } from './news';
import {
  NteeOrganizationTypeInstance,
  NteeOrganizationTypeAttributes,
} from './nteeOrganizationType';
import {
  OrganizationTagInstance,
  OrganizationTagAttributes,
} from './organizationTag';
import { Form990Instance, Form990Attributes } from './form990';
import { BoardTermInstance, BoardTermAttributes } from './boardTerm';

export interface OrganizationAttributes {
  id?: number;
  uuid?: string;
  name: string;
  ein?: string;
  duns?: string;
  stateCorpId?: string;
  // org ntee codes multi
  // org tags multi
  description?: string;
  address?: Address;
  links?: Link[];
  founded?: Date;
  dissolved?: Date;
  legacyData?: LegacyData;
  publicFunder?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // From meta table join:
  countGrantsFrom?: number;
  countGrantsTo?: number;
  countDistinctFunders?: number;
  countDistinctRecipients?: number;
  totalReceived?: number;
  totalFunded?: number;
  grantdatesStart?: Date;
  grantdatesEnd?: Date;

  // Relationships
  getOrganizationOrganizationTag?: Sequelize.BelongsToGetAssociationMixin<
    OrganizationTagInstance[]
  >;
  setOrganizationOrganizationTag?: Sequelize.BelongsToSetAssociationMixin<
    OrganizationTagInstance[],
    number[]
  >;
  getOrganizationNteeOrganizationType?: Sequelize.BelongsToGetAssociationMixin<
    NteeOrganizationTypeInstance[]
  >;
  setOrganizationNteeOrganizationType?: Sequelize.BelongsToSetAssociationMixin<
    NteeOrganizationTypeInstance[],
    number[]
  >;
}

// Follows the lead of https://github.com/commerceguys/addressing#data-model
export interface Address {
  countryCode?: string; // Country code
  administrativeArea?: string; // Administrative area
  locality?: string; // Locality (City)
  dependentLocality?: string; // Dependent Locality
  postalCode?: string; // Postal code
  sortingCode?: string; // Sorting code
  addressLine1?: string; // Address line 1
  addressLine2?: string; // Address line 2
  organization?: string; // Organization
  givenName?: string; // Given name (First name)
  additionalName?: string; // Additional name (Middle name / Patronymic)
  familyName?: string; // Family name (Last name)
}

export interface Link {
  description?: string;
  url?: string;
}

export interface LegacyData {
  clientProject?: any;
  drupalPath?: string;
  drupalId?: number;
}

export type OrganizationInstance = Sequelize.Instance<OrganizationAttributes> &
  OrganizationAttributes;

const organizationColumns = {
  uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: { type: Sequelize.STRING, allowNull: false },
  ein: { type: Sequelize.STRING, allowNull: true },
  duns: { type: Sequelize.STRING, allowNull: true },
  stateCorpId: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'state_corp_id',
  },
  description: { type: Sequelize.TEXT, allowNull: true },
  address: { type: Sequelize.JSON, allowNull: true },
  links: { type: Sequelize.JSON, allowNull: true },
  founded: { type: Sequelize.DATEONLY, allowNull: true },
  dissolved: { type: Sequelize.DATEONLY, allowNull: true },
  legacyData: {
    type: Sequelize.JSON,
    allowNull: true,
    field: 'legacy_data',
  },
  publicFunder: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    field: 'public_funder',
  },

  // From meta table join:
  countGrantsFrom: {
    type: new Sequelize.VIRTUAL(Sequelize.INTEGER),
    field: 'count_grants_from',
  },
  countGrantsTo: {
    type: new Sequelize.VIRTUAL(Sequelize.INTEGER),
    field: 'count_grants_to',
  },
  countDistinctFunders: {
    type: new Sequelize.VIRTUAL(Sequelize.INTEGER),
    field: 'count_distinct_funders',
  },
  countDistinctRecipients: {
    type: new Sequelize.VIRTUAL(Sequelize.INTEGER),
    field: 'count_distinct_recipients',
  },
  totalReceived: {
    type: new Sequelize.VIRTUAL(Sequelize.BIGINT),
    field: 'total_received',
  },
  totalFunded: {
    type: new Sequelize.VIRTUAL(Sequelize.BIGINT),
    field: 'total_funded',
  },
  grantdatesStart: {
    type: new Sequelize.VIRTUAL(Sequelize.DATEONLY),
    field: 'grantdates_start',
  },
  grantdatesEnd: {
    type: new Sequelize.VIRTUAL(Sequelize.DATEONLY),
    field: 'grantdates_end',
  },
};

export default (sequelize: Sequelize.Sequelize) => {
  let Organization = sequelize.define<
    OrganizationInstance,
    OrganizationAttributes
  >('Organization', organizationColumns, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    tableName: 'organization',
  });

  // Set up relations
  Organization.associate = ({
    BoardTerm,
    Form990,
    Grant,
    News,
    NteeOrganizationType,
    OrganizationTag,
  }: {
    BoardTerm: Sequelize.Model<BoardTermInstance, BoardTermAttributes>;
    Form990: Sequelize.Model<Form990Instance, Form990Attributes>;
    Grant: Sequelize.Model<GrantInstance, GrantAttributes>;
    News: Sequelize.Model<NewsInstance, NewsAttributes>;
    NteeOrganizationType: Sequelize.Model<
      NteeOrganizationTypeInstance,
      NteeOrganizationTypeAttributes
    >;
    OrganizationTag: Sequelize.Model<
      OrganizationTagInstance,
      OrganizationTagAttributes
    >;
  }) => {
    // @ts-ignore
    Organization.BoardTerms = Organization.hasMany(BoardTerm, {
      sourceKey: 'id',
      foreignKey: 'organization',
    });

    // @ts-ignore
    Organization.Forms990 = Organization.hasMany(Form990, {
      sourceKey: 'ein',
      foreignKey: 'ein',
    });

    // @ts-ignore
    Organization.GrantsFunded = Organization.hasMany(Grant, {
      as: 'organization_grants_funded',
      foreignKey: 'from',
    });

    // @ts-ignore
    Organization.GrantsReceived = Organization.hasMany(Grant, {
      as: 'organization_grants_received',
      foreignKey: 'to',
    });

    // @ts-ignore
    Organization.News = Organization.belongsToMany(News, {
      through: 'news_organizations',
      as: 'NewsOrganizations',
      foreignKey: 'organization_id',
      otherKey: 'news_id',
    });

    // @ts-ignore
    Organization.NteeOrganizationTypes = Organization.belongsToMany(
      NteeOrganizationType,
      {
        through: 'organization_ntee_organization_type',
        as: 'OrganizationNteeOrganizationType',
        foreignKey: 'organization_id',
        otherKey: 'ntee_organization_type_id',
      }
    );

    // @ts-ignore
    Organization.OrganizationTags = Organization.belongsToMany(
      OrganizationTag,
      {
        through: 'organization_organization_tag',
        as: 'OrganizationOrganizationTag',
        foreignKey: 'organization_id',
        otherKey: 'organization_tag_id',
      }
    );
  };

  return Organization;
};

/**
 * These fields are defined as "virtual" in Sequelize
 * and are the product of a JOIN with the organization_meta table
 */
export const organizationSpecialFields: GraphQLFieldConfigMap<never, never> = {
  countGrantsFrom: { type: GraphQLInt },
  countGrantsTo: { type: GraphQLInt },
  countDistinctFunders: { type: GraphQLInt },
  countDistinctRecipients: { type: GraphQLInt },
  totalReceived: { type: GraphQLBigInt },
  totalFunded: { type: GraphQLBigInt },
  grantdatesStart: { type: GraphQLString },
  grantdatesEnd: { type: GraphQLString },
};

// Add a join to a organization query
interface AddJoin {
  (opts: any): string;
}

export const organizationResolver = (db: Db, orgAddJoin?: AddJoin) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, nameLike },
  context,
  info
): Promise<OrganizationInstance[]> => {
  let where = '';
  if (nameLike) {
    where = `WHERE o.name ILIKE ${escape(nameLike)}`;
  }

  let addedJoin = '';
  if (opts && orgAddJoin) {
    addedJoin = orgAddJoin(opts);
  }

  const results = await db.sequelize.query(
    `SELECT o.*, ${specialCols(organizationSpecialFields, 'om').join(',')}
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

export const createGetOrganizationByIdDataloader = (
  db: Db
): DataLoader<number, OrganizationInstance> => {
  return new DataLoader(
    async (ids: number[]): Promise<OrganizationInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT o.*, ${specialCols(organizationSpecialFields, 'om').join(',')}
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

export const createGetOrganizationByUuidDataloader = (
  db: Db
): DataLoader<number, OrganizationInstance> => {
  return new DataLoader(
    async (uuids: number[]): Promise<OrganizationInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT o.*, ${specialCols(organizationSpecialFields, 'om').join(',')}
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

export const singleOrganizationResolver = (getId?: GetIdFromOpts) => async (
  opts,
  args,
  context,
  info
): Promise<OrganizationInstance> => {
  if (getId) {
    return context.getOrganizationById.load(getId(opts));
  }

  if (args.id) {
    return context.getOrganizationById.load(args.id);
  }

  if (args.uuid) {
    return context.getOrganizationByUuid.load(args.uuid);
  }

  throw new Error('must supply either getId or args with id or uuid property');
};

export const organizationArgs = {
  ...ledgerListArgs('Organization', Object.keys(organizationColumns)),
  nameLike: {
    type: GraphQLString,
  },
};
