import * as Sequelize from 'sequelize';

import {
  OrganizationInstance,
  OrganizationAttributes,
} from './organization';

export interface OrganizationMetaAttributes {
  id?: number;
  totalReceived: number;
  totalFunded: number;
  grantdatesStart: Date;
  grantdatesEnd: Date;
}

export type OrganizationMetaInstance = Sequelize.Instance<OrganizationMetaAttributes> &
  OrganizationMetaAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let OrganizationMeta = sequelize.define<
    OrganizationMetaInstance,
    OrganizationMetaAttributes
  >(
    'OrganizationMeta',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'organization',
          key: 'id',
        },
      },
      totalReceived: {
        type: Sequelize.BIGINT,
        field: 'total_received',
      },
      totalFunded: {
        type: Sequelize.BIGINT,
        field: 'total_funded',
      },
      grantdatesStart: {
        type: Sequelize.DATEONLY,
        field: 'grantdates_start',
      },
      grantdatesEnd: {
        type: Sequelize.DATEONLY,
        field: 'grantdates_end',
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'organization_meta',
      name: {
        singular: 'organizationMeta',
        plural: 'organizationMeta',
      },
    }
  );

  OrganizationMeta.associate = ({
    Organization,
  }: {
    Organization: Sequelize.Model<
      OrganizationInstance,
      OrganizationAttributes
    >;
  }) => {
    // @ts-ignore
    OrganizationMeta.Organization = OrganizationMeta.hasOne(Organization, {
      foreignKey: 'id',
    });
  };


  return OrganizationMeta;
};
