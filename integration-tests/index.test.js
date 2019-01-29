import { request } from 'graphql-request';
import { promisify } from 'util';

import createServer from '../dist/server';
import dbFactory, * as models from '../dist/db/models';

import * as orgsWithGrants from './test-queries/orgs-with-grants';
import * as someNews from './test-queries/some-news';
import * as boardTerms from './test-queries/board-terms';
import * as moreMeta from './test-queries/more-meta';
import * as orgNameLike from './test-queries/org-name-like';

const createServerInstance = async () => {
  const db = dbFactory();
  const server = createServer(db);
  const instance = await server.start();
  const { port } = instance.address();

  return {
    instance,
    db,
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

test('provides new fields in meta response', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, moreMeta.query);

  expect(res).toEqual(moreMeta.expected.data);

  instance.close();
});

test('organization_meta updates automatically', async () => {
  // Arange
  const { uri, instance, db } = await createServerInstance();
  const query = `
query foo {
	giver: organizations(id: 3) {
		countGrantsTo
		countGrantsFrom
		countDistinctFunders
		countDistinctRecipients
	}
	receiver: organizations(id: 91) {
		countGrantsTo
		countGrantsFrom
		countDistinctFunders
		countDistinctRecipients
	}
}`;

  const resBefore = await request(uri, query);

  // Act
  const newGrant = await db.Grant.create({
    to: 91,
    from: 3,
    dateFrom: new Date(2010, 6, 17),
    dateTo: new Date(2011, 6, 17),
    amount: 138000,
    source: 'hey',
  });
  const resAfter = await request(uri, query);

  await newGrant.destroy();

  // Assert
  expect(resBefore).toEqual({
    giver: [
      {
        countGrantsTo: 0,
        countGrantsFrom: 0,
        countDistinctFunders: 0,
        countDistinctRecipients: 0,
      },
    ],
    receiver: [
      {
        countGrantsTo: 17,
        countGrantsFrom: 17,
        countDistinctFunders: 17,
        countDistinctRecipients: 17,
      },
    ],
  });
  expect(resAfter).toEqual({
    giver: [
      {
        countGrantsTo: 0,
        countGrantsFrom: 1,
        countDistinctFunders: 0,
        countDistinctRecipients: 1,
      },
    ],
    receiver: [
      {
        countGrantsTo: 18,
        countGrantsFrom: 17,
        countDistinctFunders: 18,
        countDistinctRecipients: 17,
      },
    ],
  });

  instance.close();
});

test('filters organizations by name', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, orgNameLike.query);

  expect(res).toEqual(orgNameLike.expected.data);

  instance.close();
});

