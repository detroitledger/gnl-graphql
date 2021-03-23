import * as Sequelize from 'sequelize';

export interface UserAttributes {
  id?: number;
  uuid?: string;
  name: string;
  email: string;

  createdAt?: string;
  updatedAt?: string;
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let User = sequelize.define<UserInstance, UserAttributes>(
    'User',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'user',
    }
  );

  return User;
};
