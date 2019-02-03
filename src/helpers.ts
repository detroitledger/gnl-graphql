import * as decamelize from 'decamelize';

import {
  GraphQLEnumType,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

export const MAX_LIMIT = 100;

/**
 * Produces a SQL column select fragment based on the special fields
 * defined above.
 *
 * The provided field config will never have resolve or subscribe props,
 * hence the <never, never>.
 */
export const specialCols = (
  specialFields: GraphQLFieldConfigMap<never, never>,
  alias: string
) =>
  Object.keys(specialFields).map(
    col => `${alias}.${decamelize(col)} AS "${decamelize(col)}"`
  );

/**
 * Helper to generate common list arguments.
 *
 * A little nicer than what graphql-sequelize offers:
 *  - order NULLs last
 *  - enum orderBy options
 *
 * Does not implement a MAX_LIMIT guard!
 * That is the resolver's responsibility.
 */
export const ledgerListArgs = (
  name: string,
  tableAttributes: string[]
): GraphQLFieldConfigArgumentMap => ({
  orderBy: {
    type: new GraphQLEnumType({
      name: `orderBy${name}`,
      values: tableAttributes.reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: { value: cur },
        }),
        {}
      ),
    }),
    defaultValue: 'id',
    description: 'sort results by given field',
  },
  orderByDirection: {
    type: new GraphQLEnumType({
      name: `orderByDirection${name}`,
      values: {
        ASC: { value: 'ASC NULLS LAST' },
        DESC: { value: 'DESC NULLS LAST' },
      },
    }),
    defaultValue: 'ASC NULLS LAST',
    description: 'sort direction',
  },
  limit: {
    type: GraphQLInt,
    defaultValue: 10,
    description: `Number of items to return, maximum ${MAX_LIMIT}`,
  },
  offset: {
    type: GraphQLInt,
    defaultValue: 0,
  },
  uuid: {
    type: GraphQLString,
  },
  id: {
    type: GraphQLInt,
  },
});
