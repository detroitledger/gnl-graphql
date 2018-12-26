import { request } from 'graphql-request';
import { promisify } from 'util';

import createServer from '../dist/server';
import dbFactory, * as models from '../dist/db/models';

import * as orgsWithGrants from './test-queries/orgs-with-grants';
import * as someNews from './test-queries/some-news';
import * as boardTerms from './test-queries/board-terms';

let context = {};

const createServerInstance = async () => {
  const db = dbFactory();
  const server = createServer(db);
  const instance = await server.start();
  const { port } = instance.address();

  return {
    instance,
    uri: `http://127.0.0.1:${port}`,
  };
};

test('answers a sample query', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, orgsWithGrants.query);

  expect(res).toEqual(orgsWithGrants.expected.data);

  instance.close();
});

test('answers a news sample query', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, someNews.query);

  expect(res).toEqual(someNews.expected.data);

  instance.close();
});

test('provides board term data with an organization', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, boardTerms.query);

  expect(res).toEqual(boardTerms.expected.data);

  instance.close();
});
