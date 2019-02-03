import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';

import { GraphQLFieldConfigMap } from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { GrantInstance, GrantAttributes } from './grant';

// Included in Guidestar data
// TODO: Where else do we get these?
export interface NteeGrantTypeAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NteeGrantTypeInstance = Sequelize.Instance<
  NteeGrantTypeAttributes
> &
  NteeGrantTypeAttributes;

const nteeGrantTypeColumns = {
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
  let NteeGrantType = sequelize.define<
    NteeGrantTypeInstance,
    NteeGrantTypeAttributes
  >('NteeGrantType', nteeGrantTypeColumns, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    tableName: 'ntee_grant_type',
  });

  NteeGrantType.associate = ({
    Grant,
  }: {
    Grant: Sequelize.Model<GrantInstance, GrantAttributes>;
  }) => {
    // @ts-ignore
    NteeGrantType.Grants = NteeGrantType.belongsToMany(Grant, {
      through: 'grant_ntee_grant_type',
      as: 'GrantNteeGrantType',
      foreignKey: 'ntee_grant_type_id',
      otherKey: 'grant_id',
    });
  };

  return NteeGrantType;
};

export const nteeGrantTypeSpecialFields: GraphQLFieldConfigMap<never, never> = {
  total: { type: GraphQLBigInt },
};

export const nteeGrantTypeArgs = ledgerListArgs(
  'NteeGrantType',
  Object.keys(nteeGrantTypeColumns)
);

interface NteeGrantTypeResolverOptions {
  limitToGrantId: boolean;
}

const defaultNteeGrantTypeResolverOptions = {
  limitToGrantId: false,
};

export const nteeGrantTypeResolver = (
  db: Db,
  resolverOpts: NteeGrantTypeResolverOptions = defaultNteeGrantTypeResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
): Promise<NteeGrantTypeInstance> => {
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
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.NteeGrantType,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};
