import * as Sequelize from 'sequelize';

// Included in Guidestar data
// TODO: Where else do we get these?
export interface NteeGrantTypeAttributes {
    id?: string
    name: string
    code?: string // they don't seem to have codes...
    description?: string
    createdAt?: string
    updatedAt?: string
};

export type NteeGrantTypeInstance = Sequelize.Instance<NteeGrantTypeAttributes> & NteeGrantTypeAttributes;

export default (sequelize: Sequelize.Sequelize) => sequelize.define<NteeGrantTypeInstance, NteeGrantTypeAttributes>('NteeGrantType', {
    id: { type: Sequelize.UUIDV4, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
    name: { type: Sequelize.STRING, allowNull: false },
    code: { type: Sequelize.STRING, allowNull: true },
    description: { type: Sequelize.STRING, allowNull: true },
});
