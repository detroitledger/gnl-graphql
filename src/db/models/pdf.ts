import * as Sequelize from 'sequelize';
import { escape } from 'sequelize/lib/sql-string';
import * as decamelize from 'decamelize';
import { GraphQLBoolean } from 'graphql';

import { Db } from './';

import { getUserFromToken } from '../../auth';

import { ledgerListArgs, MAX_LIMIT } from '../../helpers';

import { OrganizationInstance, OrganizationAttributes } from './organization';
import { UserInstance, UserAttributes } from './user';

export interface PdfAttributes {
  id?: number;
  uuid?: string;
  url: string;
  done: boolean;
  year: number;
  current_page: number;

  // Relationships
  user?: number;
  organization: number;

  createdAt?: string;
  updatedAt?: string;
}

export type PdfInstance = Sequelize.Instance<PdfAttributes> & PdfAttributes;

const pdfColumns = {
  uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.UUIDV4,
  },
  url: { type: Sequelize.STRING, allowNull: false },
  done: { type: Sequelize.BOOLEAN, allowNull: false },
  year: { type: Sequelize.INTEGER, allowNull: false },
  current_page: { type: Sequelize.INTEGER, allowNull: true },
  user: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: 'user', key: 'id' },
  },
  organization: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'organization', key: 'id' },
  },
};

export default (sequelize: Sequelize.Sequelize) => {
  let Pdf = sequelize.define<PdfInstance, PdfAttributes>('Pdf', pdfColumns, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    tableName: 'pdf',
  });

  Pdf.associate = ({
    Organization,
    User,
  }: {
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
    User: Sequelize.Model<UserInstance, UserAttributes>;
  }) => {
    // @ts-ignore
    Pdf.User = Pdf.belongsTo(User, {
      as: 'pdf_user',
      foreignKey: 'user',
      targetKey: 'id',
    });
    // @ts-ignore
    Pdf.Organization = Pdf.belongsTo(Organization, {
      as: 'pdf_organization',
      foreignKey: 'organization',
      targetKey: 'id',
    });
  };

  return Pdf;
};

export const pdfArgs = {
  ...ledgerListArgs('Pdf', Object.keys(pdfColumns)),
  limitToCurrentUser: {
    type: GraphQLBoolean,
    defaultValue: true,
  },
};

export const pdfResolver = (db: Db) => async (
  opts,
  { limit, limitToCurrentUser, offset, orderBy, orderByDirection },
  context,
  info
): Promise<PdfInstance[]> => {
  let where = '';
  // Fetching only pdfs related to a specific user
  if (limitToCurrentUser) {
    const authenticatedUser = await getUserFromToken(
      context.token,
      context.oauthClient,
      db
    );

    if (!authenticatedUser) throw new Error('not authenticated');
    where = `WHERE p.user=${escape(authenticatedUser.id)}`;
  }

  const results = await db.sequelize.query(
    `SELECT p.id, p.uuid, p.url, p.done, p.year, p.current_page, p.user, p.organization, p.created_at, p.updated_at
FROM pdf p
${where}
ORDER BY "${decamelize(orderBy)}" ${orderByDirection}
LIMIT :limit
OFFSET :offset`,
    {
      type: db.Sequelize.QueryTypes.SELECT,
      model: db.Pdf,
      mapToModel: true,
      replacements: {
        limit: Math.min(limit, MAX_LIMIT),
        offset,
      },
    }
  );

  return results;
};
