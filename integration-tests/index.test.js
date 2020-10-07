import { request, GraphQLClient } from 'graphql-request';
import { promisify } from 'util';

import createServer from '../dist/server';
import dbFactory, * as models from '../dist/db/models';

import * as orgsWithGrants from './test-queries/orgs-with-grants';
import * as someNews from './test-queries/some-news';
import * as boardTerms from './test-queries/board-terms';
import * as moreMeta from './test-queries/more-meta';
import * as orgNameLike from './test-queries/org-name-like';
import * as sortOrgGrantsByDate from './test-queries/sort-org-grants-by-date';

jest.mock('google-auth-library');
import { OAuth2Client } from 'google-auth-library';

OAuth2Client.mockImplementation(() => ({
  verifyIdToken: jest.fn().mockImplementation(({ idToken }) => ({
    getPayload: () => ({
      email: idToken === 'good user' ? 'good@user' : 'bad@user',
    }),
  })),
}));

const createServerInstance = async () => {
  const db = dbFactory();
  const oauthClient = new OAuth2Client('client id');
  const server = createServer(db, oauthClient);
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
  giver: organization(id: 3) {
    countGrantsTo
    countGrantsFrom
    countDistinctFunders
    countDistinctRecipients
  }
  receiver: organization(id: 91) {
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
    giver: {
      countGrantsTo: 0,
      countGrantsFrom: 0,
      countDistinctFunders: 0,
      countDistinctRecipients: 0,
    },
    receiver: {
      countGrantsTo: 17,
      countGrantsFrom: 17,
      countDistinctFunders: 17,
      countDistinctRecipients: 17,
    },
  });
  expect(resAfter).toEqual({
    giver: {
      countGrantsTo: 0,
      countGrantsFrom: 1,
      countDistinctFunders: 0,
      countDistinctRecipients: 1,
    },
    receiver: {
      countGrantsTo: 18,
      countGrantsFrom: 17,
      countDistinctFunders: 18,
      countDistinctRecipients: 17,
    },
  });

  instance.close();
});

test('filters organizations by name', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, orgNameLike.query);

  expect(res).toEqual(orgNameLike.expected.data);

  instance.close();
});

test('sorts organization grants by date', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(uri, sortOrgGrantsByDate.query);

  expect(res).toEqual(sortOrgGrantsByDate.expected.data);

  instance.close();
});

test('filter organization grants funded/received by description', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(
    uri,
    `
query filterOrganizationGrants {
  organization(id: 91) {
    grantsFunded(
      limit: 10,
      orderByDirection: ASC,
      orderBy: dateFrom,
      textLike: { description: "grant 2 description" }
    ) {
      description
    }
  }
}
`
  );

  expect(res).toEqual({
    organization: {
      grantsFunded: [
        {
          description: 'grant 2 description',
        },
        {
          description: 'grant 2 description',
        },
      ],
    },
  });

  instance.close();
});

test('filter organization grants funded/received by name', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(
    uri,
    `
query filterOrganizationGrants {
  organization(id: 93) {
    grantsFunded(
      limit: 10,
      orderByDirection: ASC,
      orderBy: dateFrom,
      textLike: { oToName: "test organization 8%" }
    ) {
      to { name }
    }
  }
}
`
  );

  expect(res).toEqual({
    organization: {
      grantsFunded: [
        {
          to: {
            name: 'test organization 89',
          },
        },
        {
          to: {
            name: 'test organization 88',
          },
        },
        {
          to: {
            name: 'test organization 87',
          },
        },
        {
          to: {
            name: 'test organization 86',
          },
        },
        {
          to: {
            name: 'test organization 85',
          },
        },
        {
          to: {
            name: 'test organization 84',
          },
        },
      ],
    },
  });

  instance.close();
});

test('filter organization grants funded/received by grant tag', async () => {
  const { uri, instance, db } = await createServerInstance();

  const grants = await request(
    uri,
    `
query filterOrganizationGrants {
  organization(id: 93) {
    grantsFunded(
      limit: 10,
      orderByDirection: ASC,
      orderBy: dateFrom,
      textLike: { oToName: "test organization 8%" }
    ) {
      uuid
    }
  }
}`
  );

  // Make a new grant tag, and tag one of this org's grants w that tag
  const newGrantTag = await db.GrantTag.create({
    name: 'new grant tag',
    description: 'just for org id 93 ;)',
  });

  const grant = await db.Grant.findOne({
    where: { uuid: grants.organization.grantsFunded[0].uuid },
  });
  grant.setGrantGrantTag([newGrantTag]);
  await grant.save();

  const res = await request(
    uri,
    `
query filterOrganizationGrants {
  organization(id: 93) {
    grantsFunded(
      limit: 10,
      orderByDirection: ASC,
      orderBy: dateFrom,
      havingTag: "${newGrantTag.uuid}"
    ) {
      uuid
    }
  }
}
`
  );

  expect(res).toEqual({
    organization: {
      grantsFunded: [
        {
          uuid: grant.uuid,
        },
      ],
    },
  });

  instance.close();
});

test("list grant tags related to a specific organization's grants", async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(
    uri,
    `
query organizationGrantTags {
  organization(id: 92) {
    organizationGrantTags {
      name
    }
  }
}
`
  );

  expect(res).toEqual({
    organization: {
      organizationGrantTags: [
        {
          name: 'test grant tag 0',
        },
        {
          name: 'test grant tag 1',
        },
        {
          name: 'test grant tag 2',
        },
        {
          name: 'test grant tag 3',
        },
      ],
    },
  });

  instance.close();
});

test('stats', async () => {
  const { uri, instance } = await createServerInstance();

  const res = await request(
    uri,
    `
query homepage {
  stats {
    totalNumOrgs
    totalNumGrants
    totalGrantsDollars
  }
}
`
  );

  expect(res).toEqual({
    stats: {
      totalNumOrgs: 100,
      totalNumGrants: 738,
      totalGrantsDollars: 49800,
    },
  });

  instance.close();
});

test('mutation', async () => {
  const { uri, instance } = await createServerInstance();

  const client = new GraphQLClient(uri, {
    headers: {
      'X-Auth-Token': 'good user',
    },
  });

  const twoOrgs = await client.request(`
query twoOrgs {
  organizations(
    limit: 2
    offset: 0
    orderBy: totalReceived
    orderByDirection: DESC
  ) {
    uuid
  }
}
  `);

  const res = await client.request(
    `
mutation addstuff {
  addGrant(input: {
    from: "${twoOrgs.organizations[0].uuid}"
    to: "${twoOrgs.organizations[1].uuid}"
    dateTo: "2019-02-01"
    dateFrom: "2019-01-01"
    amount: "123"
  }) {
    amount
  }
}
`
  );

  expect(res).toEqual({
    addGrant: {
      amount: 123,
    },
  });

  instance.close();
});
