import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';

import { GraphQLFieldConfigMap } from 'graphql';

import * as GraphQLBigInt from 'graphql-bigint';

import { Db } from './';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { OrganizationInstance, OrganizationAttributes } from './organization';

// https://nccs.urban.org/classification/national-taxonomy-exempt-entities
// https://nccs.urban.org/sites/all/nccs-archive/kbfiles/324/NTEE%20Two%20Page_2005.DOC
// http://www.guidestar.org/rxg/help/ntee-codes.aspx
export interface NteeOrganizationTypeAttributes
  extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  code: string;
  description?: string;
  drupalId?: number;
  totalFunded?: number;
  totalReceived?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NteeOrganizationTypeInstance = Sequelize.Instance<
  NteeOrganizationTypeAttributes
> &
  NteeOrganizationTypeAttributes;

const nteeOrganizationTypeColumns = {
  uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.UUIDV4,
  },
  name: { type: Sequelize.STRING, allowNull: false },
  code: { type: Sequelize.STRING, allowNull: false },
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
  let NteeOrganizationType = sequelize.define<
    NteeOrganizationTypeInstance,
    NteeOrganizationTypeAttributes
  >('NteeOrganizationType', nteeOrganizationTypeColumns, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    tableName: 'ntee_organization_type',
  });

  NteeOrganizationType.associate = ({
    Organization,
  }: {
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
  }) => {
    // @ts-ignore
    NteeOrganizationType.Organizations = NteeOrganizationType.belongsToMany(
      Organization,
      {
        through: 'organization_ntee_organization_type',
        as: 'OrganizationNteeOrganizationType',
        foreignKey: 'ntee_organization_type_id',
        otherKey: 'organization_id',
      }
    );
  };

  return NteeOrganizationType;
};

export const nteeOrganizationTypeSpecialFields: GraphQLFieldConfigMap<
  never,
  never
> = {
  totalReceived: { type: GraphQLBigInt },
  totalFunded: { type: GraphQLBigInt },
};

export const nteeOrganizationTypeArgs = ledgerListArgs(
  'NteeOrganizationType',
  Object.keys(nteeOrganizationTypeColumns)
);

interface NteeOrganizationTypeResolverOptions {
  limitToOrganizationId: boolean;
}

const defaultNteeOrganizationTypeResolverOptions = {
  limitToOrganizationId: false,
};

export const nteeOrganizationTypeResolver = (
  db: Db,
  resolverOpts: NteeOrganizationTypeResolverOptions = defaultNteeOrganizationTypeResolverOptions
) => async (
  opts,
  { limit, offset, orderBy, orderByDirection, uuid = null },
  context,
  info
): Promise<NteeOrganizationTypeInstance[]> => {
  let where = '';
  // Fetching only organization tags related to a specific organization
  if (resolverOpts.limitToOrganizationId) {
    where = `WHERE oot.organization_id=${escape(opts.dataValues.id)}`;
  } else {
    where = uuid ? `WHERE ot.uuid = ${escape(uuid)}` : '';
  }

  const results = await db.sequelize.query(
    `SELECT ot.id, ot.uuid, ot.name, ot.code, ot.description, SUM(gf.amount) as "total_funded", SUM(gr.amount) as "total_received"
FROM ntee_organization_type ot
LEFT JOIN organization_ntee_organization_type oot ON ot.id=oot.ntee_organization_type_id
LEFT JOIN "grant" gf ON gf.from=oot.organization_id
LEFT JOIN "grant" gr ON gr.to=oot.organization_id
${where}
GROUP BY ot.id
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.NteeOrganizationType,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};
