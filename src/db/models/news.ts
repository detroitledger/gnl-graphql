import * as Sequelize from 'sequelize';

import { OrganizationInstance, OrganizationAttributes } from './organization';
import { GrantInstance, GrantAttributes } from './grant';

export interface NewsAttributes {
  id?: number;
  uuid?: string;
  date?: Date;
  title?: string;
  description?: string;
  link?: string;

  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getNewsGrants?: Sequelize.BelongsToGetAssociationMixin<GrantInstance[]>;
  setNewsGrants?: Sequelize.BelongsToSetAssociationMixin<
    GrantInstance[],
    number[]
  >;
  getNewsOrganizations?: Sequelize.BelongsToGetAssociationMixin<
    OrganizationInstance[]
  >;
  setNewsOrganizations?: Sequelize.BelongsToSetAssociationMixin<
    OrganizationInstance[],
    number[]
  >;
}

export type NewsInstance = Sequelize.Instance<NewsAttributes> & NewsAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let News = sequelize.define<NewsInstance, NewsAttributes>(
    'News',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      date: { type: Sequelize.DATE, allowNull: true },
      title: { type: Sequelize.TEXT, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      link: { type: Sequelize.TEXT, allowNull: true },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'news',
    }
  );

  News.associate = ({
    Grant,
    Organization,
  }: {
    Grant: Sequelize.Model<GrantInstance, GrantAttributes>;
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
  }) => {
    // @ts-ignore
    News.Grants = News.belongsToMany(Grant, {
      through: 'news_grants',
      as: 'NewsGrants',
      foreignKey: 'news_id',
      otherKey: 'grant_id',
    });
    // @ts-ignore
    News.Organizations = News.belongsToMany(Organization, {
      through: 'news_organizations',
      as: 'NewsOrganizations',
      foreignKey: 'news_id',
      otherKey: 'organization_id',
    });
  };

  return News;
};
