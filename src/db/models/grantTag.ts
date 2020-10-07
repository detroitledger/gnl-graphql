import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';

import { GraphQLFieldConfigMap } from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { GrantInstance, GrantAttributes } from './grant';

export interface GrantTagAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type GrantTagInstance = Sequelize.Instance<GrantTagAttributes> &
  GrantTagAttributes;

const grantTagColumns = {
  uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.STRING, allowNull: true },
  drupalId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    field: 'drupal_id',
  },
  total: {
    type: new Sequelize.VIRTUAL(Sequelize.BIGINT),
    field: 'total',
  },
};

export default (sequelize: Sequelize.Sequelize) => {
  let GrantTag = sequelize.define<GrantTagInstance, GrantTagAttributes>(
    'GrantTag',
    grantTagColumns,
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'grant_tag',
    }
  );

  GrantTag.associate = ({
    Grant,
  }: {
    Grant: Sequelize.Model<GrantInstance, GrantAttributes>;
  }) => {
    // @ts-ignore
    GrantTag.Grants = GrantTag.belongsToMany(Grant, {
      through: 'grant_grant_tag',
      as: 'GrantGrantTag',
      foreignKey: 'grant_tag_id',
      otherKey: 'grant_id',
    });
  };

  return GrantTag;
};

export const grantTagSpecialFields: GraphQLFieldConfigMap<never, never> = {
  total: { type: GraphQLBigInt },
};

export const grantTagArgs = ledgerListArgs(
  'GrantTag',
  Object.keys(grantTagColumns)
);

interface GrantTagResolverOptions {
  limitToGrantId: boolean;
  limitToOrganizationId: boolean;
}

const defaultGrantTagResolverOptions = {
  limitToGrantId: false,
  limitToOrganizationId: false,
};

export const grantTagResolver = (
  db: Db,
  resolverOpts: GrantTagResolverOptions = defaultGrantTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
): Promise<GrantTagInstance[]> => {
  let where = '';
  // Fetching only grant tags related to a specific grant
  if (resolverOpts.limitToGrantId) {
    where = `WHERE g.id=${escape(opts.dataValues.id)}`;
  } else if (resolverOpts.limitToOrganizationId) {
    where = `
WHERE ggt.grant_id IN (
  SELECT id FROM "grant" g WHERE g.from=${escape(opts.dataValues.id)}
  UNION
  SELECT id FROM "grant" g WHERE g.to=${escape(opts.dataValues.id)}
)`;
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
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.GrantTag,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};
