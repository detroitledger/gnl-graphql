export const query = `
query foo {
  organizations(
    limit: 2
    offset: 1
    orderBy: countGrantsTo
    orderByDirection: DESC
  ) {
    countGrantsTo
    countGrantsFrom
    countDistinctFunders
    countDistinctRecipients
    name
  }
}
`;

export const expected = {
  data: {
    organizations: [
      {
        countGrantsTo: 16,
        countGrantsFrom: 16,
        countDistinctFunders: 16,
        countDistinctRecipients: 16,
        name: 'test organization 89',
      },
      {
        countGrantsTo: 16,
        countGrantsFrom: 16,
        countDistinctFunders: 16,
        countDistinctRecipients: 16,
        name: 'test organization 91',
      },
    ],
  },
};
