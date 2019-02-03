import * as Sequelize from 'sequelize';
import * as decamelize from 'decamelize';

import { Db } from './';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { OrganizationInstance, OrganizationAttributes } from './organization';
import { NewsInstance, NewsAttributes } from './news';
import {
  NteeGrantTypeInstance,
  NteeGrantTypeAttributes,
} from './nteeGrantType';
import { GrantTagInstance, GrantTagAttributes } from './grantTag';

export interface GrantAttributes {
  id?: number;
  uuid?: string;
  from: number;
  to: number;
  dateFrom?: Date;
  dateTo?: Date;
  amount?: number;
  source?: string;
  description?: string;
  internalNotes?: string;
  legacyData?: LegacyData;
  federalAwardId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getGrantGrantTag?: Sequelize.BelongsToGetAssociationMixin<GrantTagInstance[]>;
  setGrantGrantTag?: Sequelize.BelongsToSetAssociationMixin<
    GrantTagInstance[],
    number[]
  >;
  getGrantNteeGrantType?: Sequelize.BelongsToGetAssociationMixin<
    NteeGrantTypeInstance[]
  >;
  setGrantNteeGrantType?: Sequelize.BelongsToSetAssociationMixin<
    NteeGrantTypeInstance[],
    number[]
  >;
}

export interface Link {
  description?: string;
  url?: string;
}

export interface LegacyData {
  drupalPath?: string;
  drupalId?: number;
  region?: string;
}

export type GrantInstance = Sequelize.Instance<GrantAttributes> &
  GrantAttributes;

const grantColumns = {
  uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.UUIDV4,
  },
  from: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'organization', key: 'id' },
  },
  to: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'organization', key: 'id' },
  },
  dateFrom: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    field: 'date_from',
  },
  dateTo: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    field: 'date_to',
  },
  amount: { type: Sequelize.BIGINT, allowNull: true },
  source: { type: Sequelize.TEXT, allowNull: true },
  description: { type: Sequelize.TEXT, allowNull: true },
  internalNotes: {
    type: Sequelize.TEXT,
    allowNull: true,
    field: 'internal_notes',
  },
  legacyData: {
    type: Sequelize.JSON,
    allowNull: true,
    field: 'legacy_data',
  },
  federalAwardId: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'federal_award_id',
  },
};

export default (sequelize: Sequelize.Sequelize) => {
  let Grant = sequelize.define<GrantInstance, GrantAttributes>(
    'Grant',
    grantColumns,
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'grant',
    }
  );

  Grant.associate = ({
    NteeGrantType,
    GrantTag,
    Organization,
    News,
  }: {
    NteeGrantType: Sequelize.Model<
      NteeGrantTypeInstance,
      NteeGrantTypeAttributes
    >;
    GrantTag: Sequelize.Model<GrantTagInstance, GrantTagAttributes>;
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
    News: Sequelize.Model<NewsInstance, NewsAttributes>;
  }) => {
    // @ts-ignore
    Grant.GrantTags = Grant.belongsToMany(GrantTag, {
      through: 'grant_grant_tag',
      as: 'GrantGrantTag',
      foreignKey: 'grant_id',
      otherKey: 'grant_tag_id',
    });
    // @ts-ignore
    Grant.NteeGrantTypes = Grant.belongsToMany(NteeGrantType, {
      through: 'grant_ntee_grant_type',
      as: 'GrantNteeGrantType',
      foreignKey: 'grant_id',
      otherKey: 'ntee_grant_type_id',
    });
    // @ts-ignore
    Grant.Funder = Grant.belongsTo(Organization, {
      as: 'grant_organization_funder',
      foreignKey: 'from',
      targetKey: 'id',
    });
    // @ts-ignore
    Grant.Recipient = Grant.belongsTo(Organization, {
      as: 'grant_organization_recipient',
      foreignKey: 'to',
      targetKey: 'id',
    });
    // @ts-ignore
    Grant.News = Grant.belongsToMany(News, {
      through: 'news_grants',
      as: 'NewsGrants',
      foreignKey: 'grant_id',
      otherKey: 'news_id',
    });
  };

  return Grant;
};

// Add a join to a grant query
interface AddJoin {
  (opts: any): string;
}

export const grantResolver = (db: Db, grantAddWhere?: AddJoin) => async (
  opts,
  { limit, offset, orderBy, orderByDirection },
  context,
  info
): Promise<GrantInstance[]> => {
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

export const singleGrantResolver = getId => async (
  opts,
  args,
  context,
  info
): Promise<GrantInstance> => {
  return context.getGrantById.load(getId(opts));
};

export const grantArgs = ledgerListArgs('Grant', Object.keys(grantColumns));
