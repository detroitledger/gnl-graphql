import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

export interface OrganizationTagAttributes extends AbstractDrupalTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  drupalId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrganizationTagInstance = Sequelize.Instance<
  OrganizationTagAttributes
> &
  OrganizationTagAttributes;

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<OrganizationTagInstance, OrganizationTagAttributes>(
    'OrganizationTag',
    {
      uuid: {
        type: Sequelize.UUIDV4,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      drupalId: { type: Sequelize.INTEGER, allowNull: true },
    }
  );
