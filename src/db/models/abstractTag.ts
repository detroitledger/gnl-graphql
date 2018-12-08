import * as Sequelize from 'sequelize';

export interface AbstractTagAttributes {
  id?: number;
  uuid?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AbstractTagInstance = Sequelize.Instance<AbstractTagAttributes> &
  AbstractTagAttributes;
