import * as Sequelize from 'sequelize';
import * as DataLoader from 'dataloader';

import { Db } from './';

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

interface GetIdFromOpts {
  (opts: any): number;
}

export const singleUserResolver = (getId?: GetIdFromOpts) => async (
  opts,
  args,
  context,
  info
): Promise<UserInstance | null> => {
  if (getId && getId(opts)) {
    return context.getUserById.load(getId(opts));
  }

  if (args.id) {
    return context.getUserById.load(args.id);
  }

  if (args.uuid) {
    return context.getUserByUuid.load(args.uuid);
  }

  // It's ok for user to potentially not exist
  return null;
};

export const createGetUserByIdDataloader = (
  db: Db
): DataLoader<number, UserInstance> => {
  return new DataLoader(
    async (ids: number[]): Promise<UserInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT u.*
  FROM public.user u
  WHERE u.id IN(:ids)`,
        {
          type: db.Sequelize.QueryTypes.SELECT,
          model: db.User,
          mapToModel: true,
          replacements: { ids },
        }
      );

      const ordered = ids.map(
        id =>
          results.find(o => o.id === id) ||
          new Error(`cannot find user with id ${id}`)
      );

      return ordered;
    }
  );
};

export const createGetUserByUuidDataloader = (
  db: Db
): DataLoader<string, UserInstance> => {
  return new DataLoader(
    async (uuids: string[]): Promise<UserInstance[]> => {
      const results = await db.sequelize.query(
        `SELECT u.*
  FROM public.user u
  WHERE u.uuid IN(:uuids)`,
        {
          type: db.Sequelize.QueryTypes.SELECT,
          model: db.User,
          mapToModel: true,
          replacements: { uuids },
        }
      );

      const ordered = uuids.map(
        uuid =>
          results.find(o => o.uuid === uuid) ||
          new Error(`cannot find user with uuid ${uuid}`)
      );

      return ordered;
    }
  );
};
