import dotenv from 'dotenv';

import express from 'express';

import cors from 'cors';

import {
  apolloExpress,
  graphiqlExpress,
} from 'apollo-server';

import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import bodyParser from 'body-parser';

import Schema from './data/schema';
import Mocks from './data/mocks';
import Resolvers from './data/resolvers';
import { OrganizationConnector } from './data/connectors';

dotenv.config();

// add cors to fix 'access-control-allow-origin' error when connecting apollo graphql client app
const graphQLServer = express().use('*', cors());

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
});

addMockFunctionsToSchema({
  schema: executableSchema,
  mocks: Mocks,
  preserveResolvers: true,
});

graphQLServer.use('/graphql', bodyParser.json(), apolloExpress({
  schema: executableSchema,
  context: {
    connectors: {
      Organization: new OrganizationConnector(),
    },
  },
}));

graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));

graphQLServer.listen(process.env.GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${process.env.GRAPHQL_PORT}/graphql`
));
