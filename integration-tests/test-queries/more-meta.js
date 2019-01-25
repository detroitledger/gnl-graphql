export const query = `
query foo {
  organizationMetas(
    limit: 2
    offset: 1
    orderByMulti: [["countGrantsTo", "DESC"], ["id", "ASC"]]
  ) {
    countGrantsTo
    countGrantsFrom
    countDistinctFunders
    countDistinctRecipients
    organization {
      name
    }
  }
}
`;

export const expected = {
  data: {
    organizationMetas: [
      {
        countGrantsTo: 16,
        countGrantsFrom: 16,
        countDistinctFunders: 16,
        countDistinctRecipients: 16,
        organization: {
          name: 'test organization 89',
        },
      },
      {
        countGrantsTo: 16,
        countGrantsFrom: 16,
        countDistinctFunders: 16,
        countDistinctRecipients: 16,
        organization: {
          name: 'test organization 91',
        },
      },
    ],
  },
};
