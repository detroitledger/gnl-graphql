import * as Sequelize from 'sequelize';

export interface OrganizationTagAttributes {
    id?: string
    name: string
    description?: string
    createdAt?: string
    updatedAt?: string
};

export type OrganizationTagInstance = Sequelize.Instance<OrganizationTagAttributes> & OrganizationTagAttributes;

export default (sequelize: Sequelize.Sequelize) => sequelize.define<OrganizationTagInstance, OrganizationTagAttributes>('OrganizationTag', {
    id: { type: Sequelize.UUIDV4, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: true },
});
