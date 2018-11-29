import * as Sequelize from 'sequelize';
import { GrantInstance, GrantAttributes } from './grant';
import {
  NteeOrganizationTypeInstance,
  NteeOrganizationTypeAttributes,
} from './nteeOrganizationType';
import {
  OrganizationTagInstance,
  OrganizationTagAttributes,
} from './organizationTag';

export interface OrganizationAttributes {
  id?: string;
  name: string;
  ein?: number;
  duns?: number;
  stateCorpId?: number;
  // org ntee codes multi
  // org tags multi
  description?: string;
  address?: Address;
  links?: [Link];
  founded?: Date;
  dissolved?: Date;
  legacyData?: LegacyData;
  publicFunder?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getOrganizationTags?: Sequelize.BelongsToGetAssociationMixin<
    OrganizationTagInstance[]
  >;
  setOrganizationTags?: Sequelize.BelongsToSetAssociationMixin<
    OrganizationTagInstance[],
    number[]
  >;
  getNteeOrganizationTypes?: Sequelize.BelongsToGetAssociationMixin<
    NteeOrganizationTypeInstance[]
  >;
  setNteeOrganizationTypes?: Sequelize.BelongsToSetAssociationMixin<
    NteeOrganizationTypeInstance[],
    number[]
  >;
}

// Follows the lead of https://github.com/commerceguys/addressing#data-model
export interface Address {
  countryCode?: string; // Country code
  administrativeArea?: string; // Administrative area
  locality?: string; // Locality (City)
  dependentLocality?: string; // Dependent Locality
  postalCode?: string; // Postal code
  sortingCode?: string; // Sorting code
  addressLine1?: string; // Address line 1
  addressLine2?: string; // Address line 2
  organization?: string; // Organization
  givenName?: string; // Given name (First name)
  additionalName?: string; // Additional name (Middle name / Patronymic)
  familyName?: string; // Family name (Last name)
}

export interface Link {
  description?: string;
  url?: string;
}

export interface LegacyData {
  clientProject?: any;
  drupalPath?: string;
  drupalId?: number;
}

export type OrganizationInstance = Sequelize.Instance<OrganizationAttributes> &
  OrganizationAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let Organization = sequelize.define<
    OrganizationInstance,
    OrganizationAttributes
  >('Organization', {
    id: {
      type: Sequelize.UUIDV4,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    ein: { type: Sequelize.INTEGER, allowNull: true },
    duns: { type: Sequelize.INTEGER, allowNull: true },
    stateCorpId: { type: Sequelize.INTEGER, allowNull: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    address: { type: Sequelize.JSON, allowNull: true },
    links: { type: Sequelize.JSON, allowNull: true },
    founded: { type: Sequelize.DATEONLY, allowNull: true },
    dissolved: { type: Sequelize.DATEONLY, allowNull: true },
    legacyData: { type: Sequelize.JSON, allowNull: true },
    publicFunder: { type: Sequelize.BOOLEAN, allowNull: true },
  });

  Organization.associate = ({
    Grant,
    NteeOrganizationType,
    OrganizationTag,
  }: {
    Grant: Sequelize.Model<GrantInstance, GrantAttributes>;
    NteeOrganizationType: Sequelize.Model<
      NteeOrganizationTypeInstance,
      NteeOrganizationTypeAttributes
    >;
    OrganizationTag: Sequelize.Model<
      OrganizationTagInstance,
      OrganizationTagAttributes
    >;
  }) => {
    Organization.belongsToMany(NteeOrganizationType, {
      through: 'OrganizationNteeOrganizationType',
    });
    Organization.belongsToMany(OrganizationTag, {
      through: 'OrganizationOrganizationTag',
    });
    Organization.hasMany(Grant, {
      as: 'OrganizationGrantsFunded',
      foreignKey: 'from',
    });
    Organization.hasMany(Grant, {
      as: 'OrganizationGrantsReceived',
      foreignKey: 'to',
    });
  };

  return Organization;
};
