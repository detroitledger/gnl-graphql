export const query = `
query sortOrgGrantsByDate {
  organizations(
    limit: 1
    offset: 0
    orderBy: countGrantsFrom
    orderByDirection: DESC
  ) {
    name
    grantsFunded(orderBy: dateFrom, orderByDirection: ASC) {
      dateFrom
    }
  }
}
`;

export const expected = {
  data: {
    organizations: [
      {
        name: 'test organization 90',
        grantsFunded: [
          {
            dateFrom: '2001-02-02',
          },
          {
            dateFrom: '2001-02-02',
          },
          {
            dateFrom: '2001-03-03',
          },
          {
            dateFrom: '2001-03-03',
          },
          {
            dateFrom: '2001-04-04',
          },
          {
            dateFrom: '2001-04-04',
          },
          {
            dateFrom: '2001-05-05',
          },
          {
            dateFrom: '2001-05-05',
          },
          {
            dateFrom: '2001-06-06',
          },
          {
            dateFrom: '2001-06-06',
          },
        ],
      },
    ],
  },
};
