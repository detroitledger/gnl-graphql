import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';

import { GraphQLFieldConfigMap } from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { OrganizationInstance, OrganizationAttributes } from './organization';

export interface OrganizationTagAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  totalFunded?: number;
  totalReceived?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrganizationTagInstance = Sequelize.Instance<
  OrganizationTagAttributes
> &
  OrganizationTagAttributes;

const organizationTagColumns = {
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
  totalFunded: {
    type: new Sequelize.VIRTUAL(Sequelize.BIGINT),
    field: 'total_funded',
  },
  totalReceived: {
    type: new Sequelize.VIRTUAL(Sequelize.BIGINT),
    field: 'total_received',
  },
};

export default (sequelize: Sequelize.Sequelize) => {
  let OrganizationTag = sequelize.define<
    OrganizationTagInstance,
    OrganizationTagAttributes
  >('OrganizationTag', organizationTagColumns, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    tableName: 'organization_tag',
  });

  OrganizationTag.associate = ({
    Organization,
  }: {
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
  }) => {
    // @ts-ignore
    OrganizationTag.Organizations = OrganizationTag.belongsToMany(
      Organization,
      {
        through: 'organization_organization_tag',
        as: 'OrganizationOrganizationTag',
        foreignKey: 'organization_tag_id',
        otherKey: 'organization_id',
      }
    );
  };

  return OrganizationTag;
};

export const organizationTagSpecialFields: GraphQLFieldConfigMap<
  never,
  never
> = {
  totalReceived: { type: GraphQLBigInt },
  totalFunded: { type: GraphQLBigInt },
};

export const organizationTagArgs = ledgerListArgs(
  'OrganizationTag',
  Object.keys(organizationTagColumns)
);

interface OrganizationTagResolverOptions {
  limitToOrganizationId: boolean;
}

const defaultOrganizationTagResolverOptions = {
  limitToOrganizationId: false,
};

export const organizationTagResolver = (
  db,
  resolverOpts: OrganizationTagResolverOptions = defaultOrganizationTagResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
): Promise<OrganizationTagInstance[]> => {
  let where = '';
  // Fetching only organization tags related to a specific organization
  if (resolverOpts.limitToOrganizationId) {
    where = `WHERE oot.organization_id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE ot.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `
SELECT
  ot.id,
  ot.uuid,
  ot.name,
  ot.description,
  SUM(om.total_funded) as "total_funded",
  SUM(om.total_received) as "total_received"
FROM organization_tag ot
LEFT JOIN organization_organization_tag oot ON ot.id=oot.organization_tag_id
LEFT JOIN organization_meta om ON om.id=oot.organization_id
${where}
GROUP BY ot.id
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.OrganizationTag,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};
