import * as Sequelize from 'sequelize';

import { PersonInstance, PersonAttributes } from './person';

export interface BoardTermAttributes {
  id?: number;
  uuid?: string;
  person: number;
  organization: number;
  dateFrom: Date;
  dateTo: Date;
  position?: string;
  compensation?: number;
  source: string;

  createdAt?: string;
  updatedAt?: string;
}

export type BoardTermInstance = Sequelize.Instance<BoardTermAttributes> &
  BoardTermAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let BoardTerm = sequelize.define<BoardTermInstance, BoardTermAttributes>(
    'BoardTerm',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      person: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.person,
          key: 'id',
        },
      },
      organization: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: sequelize.models.organization,
          key: 'id',
        },
      },
      dateFrom: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        field: 'date_from',
      },
      dateTo: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: 'date_to',
      },
      position: { type: Sequelize.STRING, allowNull: true },
      compensation: { type: Sequelize.BIGINT, allowNull: true },
      source: { type: Sequelize.STRING, allowNull: true },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'board_term',
    }
  );

  BoardTerm.associate = ({
    Person,
  }: {
    Person: Sequelize.Model<PersonInstance, PersonAttributes>;
  }) => {
    // @ts-ignore
    BoardTerm.Person = BoardTerm.belongsTo(Person, {
      as: 'board_term_person',
      foreignKey: 'person',
      targetKey: 'id',
    });
  };

  return BoardTerm;
};
