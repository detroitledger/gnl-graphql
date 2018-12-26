export const query = `
query news {
  news(order: "reverse:date", limit: 5) {
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
        title: 'news 76 title',
        date: '2000-11-23T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 6',
          },
          {
            name: 'test organization 7',
          },
          {
            name: 'test organization 8',
          },
          {
            name: 'test organization 9',
          },
          {
            name: 'test organization 10',
          },
          {
            name: 'test organization 11',
          },
          {
            name: 'test organization 12',
          },
          {
            name: 'test organization 13',
          },
          {
            name: 'test organization 14',
          },
          {
            name: 'test organization 15',
          },
          {
            name: 'test organization 16',
          },
        ],
        grants: [
          {
            description: 'grant 6 description',
          },
          {
            description: 'grant 7 description',
          },
          {
            description: 'grant 8 description',
          },
          {
            description: 'grant 9 description',
          },
          {
            description: 'grant 10 description',
          },
          {
            description: 'grant 11 description',
          },
          {
            description: 'grant 12 description',
          },
          {
            description: 'grant 13 description',
          },
          {
            description: 'grant 14 description',
          },
          {
            description: 'grant 15 description',
          },
          {
            description: 'grant 16 description',
          },
        ],
        link: 'news 76 link',
      },
      {
        title: 'news 21 title',
        date: '2000-11-22T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 1',
          },
          {
            name: 'test organization 2',
          },
          {
            name: 'test organization 3',
          },
          {
            name: 'test organization 4',
          },
          {
            name: 'test organization 5',
          },
          {
            name: 'test organization 6',
          },
          {
            name: 'test organization 7',
          },
          {
            name: 'test organization 8',
          },
          {
            name: 'test organization 9',
          },
          {
            name: 'test organization 10',
          },
          {
            name: 'test organization 11',
          },
        ],
        grants: [
          {
            description: 'grant 1 description',
          },
          {
            description: 'grant 2 description',
          },
          {
            description: 'grant 3 description',
          },
          {
            description: 'grant 4 description',
          },
          {
            description: 'grant 5 description',
          },
          {
            description: 'grant 6 description',
          },
          {
            description: 'grant 7 description',
          },
          {
            description: 'grant 8 description',
          },
          {
            description: 'grant 9 description',
          },
          {
            description: 'grant 10 description',
          },
          {
            description: 'grant 11 description',
          },
        ],
        link: 'news 21 link',
      },
      {
        title: 'news 98 title',
        date: '2000-11-18T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 8',
          },
          {
            name: 'test organization 9',
          },
          {
            name: 'test organization 10',
          },
          {
            name: 'test organization 11',
          },
          {
            name: 'test organization 12',
          },
          {
            name: 'test organization 13',
          },
          {
            name: 'test organization 14',
          },
          {
            name: 'test organization 15',
          },
          {
            name: 'test organization 16',
          },
          {
            name: 'test organization 17',
          },
          {
            name: 'test organization 18',
          },
        ],
        grants: [
          {
            description: 'grant 8 description',
          },
          {
            description: 'grant 9 description',
          },
          {
            description: 'grant 10 description',
          },
          {
            description: 'grant 11 description',
          },
          {
            description: 'grant 12 description',
          },
          {
            description: 'grant 13 description',
          },
          {
            description: 'grant 14 description',
          },
          {
            description: 'grant 15 description',
          },
          {
            description: 'grant 16 description',
          },
          {
            description: 'grant 17 description',
          },
          {
            description: 'grant 18 description',
          },
        ],
        link: 'news 98 link',
      },
      {
        title: 'news 43 title',
        date: '2000-11-17T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 3',
          },
          {
            name: 'test organization 4',
          },
          {
            name: 'test organization 5',
          },
          {
            name: 'test organization 6',
          },
          {
            name: 'test organization 7',
          },
          {
            name: 'test organization 8',
          },
          {
            name: 'test organization 9',
          },
          {
            name: 'test organization 10',
          },
          {
            name: 'test organization 11',
          },
          {
            name: 'test organization 12',
          },
          {
            name: 'test organization 13',
          },
        ],
        grants: [
          {
            description: 'grant 3 description',
          },
          {
            description: 'grant 4 description',
          },
          {
            description: 'grant 5 description',
          },
          {
            description: 'grant 6 description',
          },
          {
            description: 'grant 7 description',
          },
          {
            description: 'grant 8 description',
          },
          {
            description: 'grant 9 description',
          },
          {
            description: 'grant 10 description',
          },
          {
            description: 'grant 11 description',
          },
          {
            description: 'grant 12 description',
          },
          {
            description: 'grant 13 description',
          },
        ],
        link: 'news 43 link',
      },
      {
        title: 'news 65 title',
        date: '2000-11-12T00:00:00.000Z',
        organizations: [
          {
            name: 'test organization 5',
          },
          {
            name: 'test organization 6',
          },
          {
            name: 'test organization 7',
          },
          {
            name: 'test organization 8',
          },
          {
            name: 'test organization 9',
          },
          {
            name: 'test organization 10',
          },
          {
            name: 'test organization 11',
          },
          {
            name: 'test organization 12',
          },
          {
            name: 'test organization 13',
          },
          {
            name: 'test organization 14',
          },
          {
            name: 'test organization 15',
          },
        ],
        grants: [
          {
            description: 'grant 5 description',
          },
          {
            description: 'grant 6 description',
          },
          {
            description: 'grant 7 description',
          },
          {
            description: 'grant 8 description',
          },
          {
            description: 'grant 9 description',
          },
          {
            description: 'grant 10 description',
          },
          {
            description: 'grant 11 description',
          },
          {
            description: 'grant 12 description',
          },
          {
            description: 'grant 13 description',
          },
          {
            description: 'grant 14 description',
          },
          {
            description: 'grant 15 description',
          },
        ],
        link: 'news 65 link',
      },
    ],
  },
};
