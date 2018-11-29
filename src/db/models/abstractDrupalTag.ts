import * as Sequelize from 'sequelize';

export interface AbstractDrupalTagAttributes {
  id?: string;
  drupalId?: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AbstractDrupalTagInstance = Sequelize.Instance<
  AbstractDrupalTagAttributes
> &
  AbstractDrupalTagAttributes;
