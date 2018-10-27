import * as Sequelize from 'sequelize';

export interface AbstractTagAttributes {
  id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AbstractTagInstance = Sequelize.Instance<AbstractTagAttributes> &
  AbstractTagAttributes;
