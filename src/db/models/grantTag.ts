import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

import { GrantInstance, GrantAttributes } from './grant';

export interface GrantTagAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type GrantTagInstance = Sequelize.Instance<GrantTagAttributes> &
  GrantTagAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let GrantTag = sequelize.define<GrantTagInstance, GrantTagAttributes>(
    'GrantTag',
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
