import * as Sequelize from 'sequelize';

import { UserAttributes, UserInstance } from '../models/user';

import dbFactory, * as models from '../models';

const ADMINS = [
  { name: 'Ben', email: 'anonyben@gmail.com' },
  { name: 'Matt', email: 'mahatm@gmail.com' },
  { name: 'Jessica', email: 'jessica.mcinchak@gmail.com' },
];

export const up = async (
  queryInterface: Sequelize.QueryInterface,
  Sequelize: Sequelize.Sequelize
) => {
  const db = dbFactory() as models.Db;

  await db.User.bulkCreate(ADMINS);
};

export const down = async (
  queryInterface: Sequelize.QueryInterface,
  Sequelize: Sequelize.Sequelize
) => {
  const db = dbFactory() as models.Db;

  for (const { email } of ADMINS) {
    await db.User.destroy({ where: { email } });
  }
};
