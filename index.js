import express from 'express';

import Schema from './data/schema';
import Mocks from './data/mocks';
import Resolvers from './data/resolvers';

import { apolloExpress, graphiqlExpress } from 'apollo-server';
import { makeExecutableSchema, addMockFunctionsToSchema} from 'graphql-tools';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';

const config = dotenv.config();

const graphQLServer = express();

const executableSchema = makeExecutableSchema({
	typeDefs: Schema,
	resolvers: Resolvers,
	// connectors: connectors,
});

addMockFunctionsToSchema({
	schema: executableSchema,
	mocks: Mocks,
	preserveResolvers: true,
});

graphQLServer.use('/graphql', bodyParser.json(), apolloExpress({
  schema: executableSchema,
  context: {},
}));

graphQLServer.use('/graphiql', graphiqlExpress({
	endpointURL: '/graphql',
}));

graphQLServer.listen(process.env.GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${process.env.GRAPHQL_PORT}/graphql`
));