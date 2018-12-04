import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

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

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<GrantTagInstance, GrantTagAttributes>('GrantTag', {
    uuid: {
      type: Sequelize.UUIDV4,
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
  });
