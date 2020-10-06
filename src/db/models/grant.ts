import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';

import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

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

// Add a where stanza to a grant query
interface AddWhere {
  (opts: any): string;
}

export const grantResolver = (db: Db, grantAddWhere?: AddWhere) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, textLike = {}, havingTag },
  context,
  info
): Promise<GrantInstance[]> => {
  let wheres: string[] = [];
  let joins: string[] = [];

  if (grantAddWhere) {
    wheres = [grantAddWhere(opts)];
  }

  Object.keys(textLike).forEach(k =>
    wheres.push(`${decamelize(k)} ILIKE ${escape(textLike[k])}`)
  );

  if (havingTag) {
    joins.push(
      `INNER JOIN grant_grant_tag ggt ON ggt.grant_id=g.id INNER JOIN grant_tag gt ON ggt.grant_tag_id=gt.id`
    );
    wheres.push(`gt.uuid=${escape(havingTag)}`);
  }

  const whereFragment =
    wheres.length > 0 ? `WHERE ${wheres.join(' AND ')}` : '';
  const joinFragment = joins.join('\n');

  const results = await db.sequelize.query(
    `
SELECT
  g.*,
  o_from.name AS o_from_name,
  o_to.name AS o_to_name
FROM "grant" g
INNER JOIN "organization" o_from
ON g.from=o_from.id
INNER JOIN "organization" o_to
ON g.to=o_to.id
${joinFragment}
${unAlias(whereFragment)}
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

const unAlias = whereFragment =>
  whereFragment
    .replace('o_from_name', 'o_from.name')
    .replace('o_to_name', 'o_to.name')
    .replace('description', 'g.description');

export const singleGrantResolver = getId => async (
  opts,
  args,
  context,
  info
): Promise<GrantInstance> => {
  return context.getGrantById.load(getId(opts));
};

const textColumns = Object.keys(grantColumns).reduce(
  (acc, cur) => {
    if (
      grantColumns[cur].type == Sequelize.TEXT ||
      grantColumns[cur].type === Sequelize.STRING
    ) {
      return [...acc, cur];
    }
    return acc;
  },
  ['oFromName', 'oToName']
);

const textLikeArgs = textColumns.reduce(
  (acc, cur) => ({
    ...acc,
    [cur]: {
      type: GraphQLString,
    },
  }),
  {}
);

export const grantArgs = {
  ...ledgerListArgs('Grant', Object.keys(grantColumns)),
  textLike: {
    type: new GraphQLInputObjectType({
      name: 'TextLike',
      fields: textLikeArgs,
    }),
  },
  havingTag: {
    type: GraphQLString,
    description: 'Only include grants with the given tag UUID',
  },
};
