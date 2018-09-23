import * as Sequelize from 'sequelize';

import { OrganizationInstance, OrganizationAttributes } from './organization';

export interface GrantAttributes {
    id?: string
    from: OrganizationInstance
    to: OrganizationInstance
    createdAt?: string
    updatedAt?: string
};

export interface Link {
    description?: string
    url?: string
}

export interface LegacyData {
    drupalPath?: string
    drupalId?: number
}

export type GrantInstance = Sequelize.Instance<GrantAttributes> & GrantAttributes;

export default (sequelize: Sequelize.Sequelize) => {
    let Grant = sequelize.define<GrantInstance, GrantAttributes>('Grant', {
        id: { type: Sequelize.UUIDV4, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        from: { type: Sequelize.UUIDV4, allowNull: false, references: { model: sequelize.models.organization, key: 'id' } },
        to: { type: Sequelize.UUIDV4, allowNull: false, references: { model: sequelize.models.organization, key: 'id' } },
    });

    Grant.associate = (
        {
            Organization,
        }: {
            Organization: Sequelize.Model<OrganizationInstance, OrganizationAttributes>,
        }
    ) => {
        Grant.hasMany(Organization);
    };
    return Grant;
};

