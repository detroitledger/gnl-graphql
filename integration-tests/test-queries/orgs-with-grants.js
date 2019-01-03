export const query = `
query foo {
  organizationMetas(
    limit: 2
    offset: 1
    orderByMulti: [["totalReceived", "ASC"]]
  ) {
    totalFunded
    totalReceived
    grantdatesStart
    grantdatesEnd
    organization {
      name
      ein
      duns
      stateCorpId
      description
      address
      links
      founded
      dissolved
      legacyData
      publicFunder
      grantsFunded {
        ...grantFields
      }
      grantsReceived {
        ...grantFields
      }
      nteeOrganizationTypes {
        name
        code
        description
      }
      organizationTags {
        name
        description
      }
    }
  }
}

fragment grantFields on Grant {
  from {
    name
  }
  to {
    name
  }
  dateFrom
  dateTo
  amount
  source
  description
  internalNotes
  legacyData
  federalAwardId
  nteeGrantTypes {
    name
    description
  }
  grantTags {
    name
    description
  }
}
`;

export const expected = {
  data: {
    organizationMetas: [
      {
        totalFunded: '20',
        totalReceived: '20',
        grantdatesStart: '2001-01-01',
        grantdatesEnd: '2001-01-01',
        organization: {
          name: 'test organization 9',
          ein: '9',
          duns: '9',
          stateCorpId: '9',
          description: 'test organization 9 description!',
          address: {
            postalCode: '9',
          },
          links: [
            {
              url: 'ftp://9',
              description: 'a link',
            },
            {
              url: 'gopher://9',
              description: 'another link',
            },
          ],
          founded: '2000-10-10',
          dissolved: '2001-10-10',
          legacyData: {
            drupalId: 9,
          },
          publicFunder: true,
          grantsFunded: [
            {
              from: {
                name: 'test organization 9',
              },
              to: {
                name: 'test organization 8',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
            {
              from: {
                name: 'test organization 9',
              },
              to: {
                name: 'test organization 10',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
          ],
          grantsReceived: [
            {
              from: {
                name: 'test organization 8',
              },
              to: {
                name: 'test organization 9',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
            {
              from: {
                name: 'test organization 10',
              },
              to: {
                name: 'test organization 9',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
          ],
          nteeOrganizationTypes: [
            {
              name: 'test ntee organization type 0',
              code: 'test ntee organization type code 0',
              description: 'test ntee organization type 0 description',
            },
            {
              name: 'test ntee organization type 1',
              code: 'test ntee organization type code 1',
              description: 'test ntee organization type 1 description',
            },
            {
              name: 'test ntee organization type 2',
              code: 'test ntee organization type code 2',
              description: 'test ntee organization type 2 description',
            },
            {
              name: 'test ntee organization type 3',
              code: 'test ntee organization type code 3',
              description: 'test ntee organization type 3 description',
            },
          ],
          organizationTags: [
            {
              name: 'test organization tag 0',
              description: 'test organization tag 0 description',
            },
            {
              name: 'test organization tag 1',
              description: 'test organization tag 1 description',
            },
            {
              name: 'test organization tag 2',
              description: 'test organization tag 2 description',
            },
            {
              name: 'test organization tag 3',
              description: 'test organization tag 3 description',
            },
          ],
        },
      },
      {
        totalFunded: '20',
        totalReceived: '20',
        grantdatesStart: '2001-01-01',
        grantdatesEnd: '2001-01-01',
        organization: {
          name: 'test organization 10',
          ein: '10',
          duns: '10',
          stateCorpId: '10',
          description: 'test organization 10 description!',
          address: {
            postalCode: '10',
          },
          links: [
            {
              url: 'ftp://10',
              description: 'a link',
            },
            {
              url: 'gopher://10',
              description: 'another link',
            },
          ],
          founded: '2000-11-11',
          dissolved: '2001-11-11',
          legacyData: {
            drupalId: 10,
          },
          publicFunder: false,
          grantsFunded: [
            {
              from: {
                name: 'test organization 10',
              },
              to: {
                name: 'test organization 9',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
            {
              from: {
                name: 'test organization 10',
              },
              to: {
                name: 'test organization 11',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
          ],
          grantsReceived: [
            {
              from: {
                name: 'test organization 9',
              },
              to: {
                name: 'test organization 10',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
            {
              from: {
                name: 'test organization 11',
              },
              to: {
                name: 'test organization 10',
              },
              dateFrom: '2001-01-01',
              dateTo: '2010-01-01',
              amount: 10,
              source: 'grant 0 source',
              description: 'grant 0 description',
              internalNotes: 'grant 0 internal notes',
              legacyData: {
                drupalId: 0,
              },
              federalAwardId: 'grant 0 federal award id',
              nteeGrantTypes: [
                {
                  name: 'test ntee grant type 0',
                  description: 'test ntee grant type 0 description',
                },
                {
                  name: 'test ntee grant type 1',
                  description: 'test ntee grant type 1 description',
                },
                {
                  name: 'test ntee grant type 2',
                  description: 'test ntee grant type 2 description',
                },
              ],
              grantTags: [
                {
                  name: 'test grant tag 0',
                  description: 'test grant tag 0 description',
                },
                {
                  name: 'test grant tag 1',
                  description: 'test grant tag 1 description',
                },
                {
                  name: 'test grant tag 2',
                  description: 'test grant tag 2 description',
                },
              ],
            },
          ],
          nteeOrganizationTypes: [
            {
              name: 'test ntee organization type 0',
              code: 'test ntee organization type code 0',
              description: 'test ntee organization type 0 description',
            },
            {
              name: 'test ntee organization type 1',
              code: 'test ntee organization type code 1',
              description: 'test ntee organization type 1 description',
            },
            {
              name: 'test ntee organization type 2',
              code: 'test ntee organization type code 2',
              description: 'test ntee organization type 2 description',
            },
            {
              name: 'test ntee organization type 3',
              code: 'test ntee organization type code 3',
              description: 'test ntee organization type 3 description',
            },
          ],
          organizationTags: [
            {
              name: 'test organization tag 0',
              description: 'test organization tag 0 description',
            },
            {
              name: 'test organization tag 1',
              description: 'test organization tag 1 description',
            },
            {
              name: 'test organization tag 2',
              description: 'test organization tag 2 description',
            },
            {
              name: 'test organization tag 3',
              description: 'test organization tag 3 description',
            },
          ],
        },
      },
    ],
  },
};
