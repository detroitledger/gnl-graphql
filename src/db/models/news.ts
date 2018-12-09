import * as Sequelize from 'sequelize';

import { OrganizationInstance, OrganizationAttributes } from './organization';

export interface NewsAttributes {
  id?: number;
  uuid?: string;

  drupal_org_id?: number;

  date?: Date;
  title?: string;
  description?: string;
  link?: string;

  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getNewsOrganizations?: Sequelize.BelongsToGetAssociationMixin<OrganizationInstance[]>;
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
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
    Organization,
  }: {
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
  }) => {
    // @ts-ignore
    News.Organizations = News.belongsToMany(Organization, {
      through: 'news_organizations',
      as: 'NewsOrganizations',
      foreignKey: 'organization_id',
      otherKey: 'news_id',
    });
  };

  return News;
};
