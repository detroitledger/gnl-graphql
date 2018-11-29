import * as Sequelize from 'sequelize';

import { OrganizationInstance, OrganizationAttributes } from './organization';
import {
  NteeGrantTypeInstance,
  NteeGrantTypeAttributes,
} from './nteeGrantType';
import { GrantTagInstance, GrantTagAttributes } from './grantTag';

export interface GrantAttributes {
  id?: string;
  from: OrganizationInstance;
  to: OrganizationInstance;
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
  let Grant = sequelize.define<GrantInstance, GrantAttributes>('Grant', {
    id: {
      type: Sequelize.UUIDV4,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    from: {
      type: Sequelize.UUIDV4,
      allowNull: false,
      references: { model: sequelize.models.organization, key: 'id' },
    },
    to: {
      type: Sequelize.UUIDV4,
      allowNull: false,
      references: { model: sequelize.models.organization, key: 'id' },
    },
    dateFrom: { type: Sequelize.DATEONLY, allowNull: true },
    dateTo: { type: Sequelize.DATEONLY, allowNull: true },
    amount: { type: Sequelize.BIGINT, allowNull: true },
    source: { type: Sequelize.TEXT, allowNull: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    internalNotes: { type: Sequelize.TEXT, allowNull: true },
    legacyData: { type: Sequelize.JSON, allowNull: true },
    federalAwardId: { type: Sequelize.STRING, allowNull: true },
  });

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
    Grant.belongsToMany(GrantTag, { through: 'GrantGrantTag' });
    Grant.belongsToMany(NteeGrantType, { through: 'GrantNteeGrantType' });
    Grant.belongsTo(Organization, {
      as: 'GrantOrganizationFunder',
      foreignKey: 'from',
      targetKey: 'id',
    });
    Grant.belongsTo(Organization, {
      as: 'GrantOrganizationRecipient',
      foreignKey: 'to',
      targetKey: 'id',
    });
  };

  return Grant;
};
