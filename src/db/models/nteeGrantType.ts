import * as Sequelize from 'sequelize';

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
  createdAt?: string;
  updatedAt?: string;
}

export type NteeGrantTypeInstance = Sequelize.Instance<
  NteeGrantTypeAttributes
> &
  NteeGrantTypeAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let NteeGrantType = sequelize.define<
    NteeGrantTypeInstance,
    NteeGrantTypeAttributes
  >(
    'NteeGrantType',
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
      tableName: 'ntee_grant_type',
    }
  );

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
