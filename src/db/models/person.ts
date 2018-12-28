import * as Sequelize from 'sequelize';

import { BoardTermInstance, BoardTermAttributes } from './boardTerm';

export interface PersonAttributes {
  id?: number;
  uuid?: string;
  name: string;
  drupalId?: number;

  createdAt?: string;
  updatedAt?: string;

  // Relationships
  getBoardTerms?: Sequelize.BelongsToGetAssociationMixin<BoardTermInstance[]>;
  setBoardTerms?: Sequelize.BelongsToSetAssociationMixin<
    BoardTermInstance[],
    number[]
  >;
}

export type PersonInstance = Sequelize.Instance<PersonAttributes> &
  PersonAttributes;

export default (sequelize: Sequelize.Sequelize) => {
  let Person = sequelize.define<PersonInstance, PersonAttributes>(
    'Person',
    {
      uuid: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      drupalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'drupal_id',
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'person',
    }
  );

  Person.associate = ({
    BoardTerm,
  }: {
    BoardTerm: Sequelize.Model<BoardTermInstance, BoardTermAttributes>;
  }) => {
    // @ts-ignore
    Person.BoardTerms = Person.belongsToMany(BoardTerm, {
      through: 'person_board_term',
      as: 'PersonBoardTerm',
      foreignKey: 'person_id',
      otherKey: 'board_term_id',
    });
  };

  return Person;
};
