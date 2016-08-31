import express from 'express';
import { apolloServer } from 'graphql-tools';
import Schema from './data/schema';
import Resolvers from './data/resolvers';
import Mocks from './data/mocks';

import dotenv from 'dotenv';

const config = dotenv.config();

const graphQLServer = express();

graphQLServer.use('/graphql', apolloServer({
  graphiql: true,
  pretty: true,
  schema: Schema,
  resolvers: Resolvers,
  allowUndefinedInResolve: false,
  printErrors: true,
  mocks: Mocks,
}));

graphQLServer.listen(process.env.GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${process.env.GRAPHQL_PORT}/graphql`
));
