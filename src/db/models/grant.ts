import * as Sequelize from 'sequelize';

import { OrganizationInstance, OrganizationAttributes } from './organization';
import {
  NteeGrantTypeInstance,
  NteeGrantTypeAttributes,
} from './nteeGrantType';
import { GrantTagInstance, GrantTagAttributes } from './grantTag';

export interface GrantAttributes {
  id?: number;
  uuid?: string;
  from: number;
  to: number;
  dateFrom?: Date;
  dateTo?: Date;
  amount?: number;
  source?: string;
  description?: string;
  internalNotes?: string;
  legacyData?: LegacyData;
  federalAwardId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getGrantGrantTag?: Sequelize.BelongsToGetAssociationMixin<GrantTagInstance[]>;
  setGrantGrantTag?: Sequelize.BelongsToSetAssociationMixin<
    GrantTagInstance[],
    number[]
  >;
  getGrantNteeGrantType?: Sequelize.BelongsToGetAssociationMixin<
    NteeGrantTypeInstance[]
  >;
  setGrantNteeGrantType?: Sequelize.BelongsToSetAssociationMixin<
    NteeGrantTypeInstance[],
    number[]
  >;
}

export interface Link {
  description?: string;
  url?: string;
}

export interface LegacyData {
  drupalPath?: string;
  drupalId?: number;
  region?: string;
}

export type GrantInstance = Sequelize.Instance<GrantAttributes> &
  GrantAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let Grant = sequelize.define<GrantInstance, GrantAttributes>(
    'Grant',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      from: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: sequelize.models.organization, key: 'id' },
      },
      to: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: sequelize.models.organization, key: 'id' },
      },
      dateFrom: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: 'date_from',
      },
      dateTo: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: 'date_to',
      },
      amount: { type: Sequelize.BIGINT, allowNull: true },
      source: { type: Sequelize.TEXT, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      internalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'internal_notes',
      },
      legacyData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'legacy_data',
      },
      federalAwardId: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'federal_award_id',
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'grant',
    }
  );

  Grant.associate = ({
    NteeGrantType,
    GrantTag,
    Organization,
  }: {
    NteeGrantType: Sequelize.Model<
      NteeGrantTypeInstance,
      NteeGrantTypeAttributes
    >;
    GrantTag: Sequelize.Model<GrantTagInstance, GrantTagAttributes>;
    Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>;
  }) => {
    // @ts-ignore
    Grant.GrantTags = Grant.belongsToMany(GrantTag, {
      through: 'grant_grant_tag',
      as: 'GrantGrantTag',
      foreignKey: 'grant_id',
      otherKey: 'grant_tag_id',
    });
    // @ts-ignore
    Grant.NteeGrantTypes = Grant.belongsToMany(NteeGrantType, {
      through: 'grant_ntee_grant_type',
      as: 'GrantNteeGrantType',
      foreignKey: 'grant_id',
      otherKey: 'ntee_grant_type_id',
    });
    // @ts-ignore
    Grant.Funder = Grant.belongsTo(Organization, {
      as: 'grant_organization_funder',
      foreignKey: 'from',
      targetKey: 'id',
    });
    // @ts-ignore
    Grant.Recipient = Grant.belongsTo(Organization, {
      as: 'grant_organization_recipient',
      foreignKey: 'to',
      targetKey: 'id',
    });
  };

  return Grant;
};
