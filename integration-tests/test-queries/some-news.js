export const query = `
query news {
  news(order: "id", limit: 5) {
    title
    date
    organizations {
      name
    }
    grants {
      description
    }
    link
  }
}
`;

export const expected = {
  data: {
    news: [
      {
        title: 'news for organization 1',
        date: '2000-01-01T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 0',
          },
        ],
        grants: [],
        link: 'news 0 link',
      },
      {
        title: 'news for organization 2',
        date: '2000-01-01T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 0',
          },
          {
            name: 'test organization 1',
          },
        ],
        grants: [],
        link: 'news 0 link',
      },
      {
        title: 'news for organization 2',
        date: '2000-02-02T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 0',
          },
          {
            name: 'test organization 1',
          },
        ],
        grants: [],
        link: 'news 1 link',
      },
      {
        title: 'news for organization 3',
        date: '2000-01-01T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 0',
          },
          {
            name: 'test organization 1',
          },
          {
            name: 'test organization 2',
          },
        ],
        grants: [],
        link: 'news 0 link',
      },
      {
        title: 'news for organization 3',
        date: '2000-02-02T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 0',
          },
          {
            name: 'test organization 1',
          },
          {
            name: 'test organization 2',
          },
        ],
        grants: [],
        link: 'news 1 link',
      },
    ],
  },
};
