import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { OrganizationInstance, OrganizationAttributes } from './organization';

export interface OrganizationTagAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrganizationTagInstance = Sequelize.Instance<
  OrganizationTagAttributes
> &
  OrganizationTagAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let OrganizationTag = sequelize.define<
    OrganizationTagInstance,
    OrganizationTagAttributes
  >(
    'OrganizationTag',
    {
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
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'organization_tag',
    }
  );

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
