import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

// Included in Guidestar data
// TODO: Where else do we get these?
export interface NteeGrantTypeAttributes extends AbstractDrupalTagAttributes {
  id?: string;
  name: string;
  description?: string;
  drupalId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NteeGrantTypeInstance = Sequelize.Instance<
  NteeGrantTypeAttributes
> &
  NteeGrantTypeAttributes;

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<NteeGrantTypeInstance, NteeGrantTypeAttributes>(
    'NteeGrantType',
    {
      id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      drupalId: { type: Sequelize.INTEGER, allowNull: true },
    }
  );
