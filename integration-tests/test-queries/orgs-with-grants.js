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
        totalFunded: '40',
        totalReceived: '40',
        grantdatesStart: '2001-02-02',
        grantdatesEnd: '2001-02-02',
        organization: {
          name: 'test organization 19',
          ein: '19',
          duns: '19',
          stateCorpId: '19',
          description: 'test organization 19 description!',
          address: {
            postalCode: '19',
          },
          links: [
            {
              url: 'ftp://19',
              description: 'a link',
            },
            {
              url: 'gopher://19',
              description: 'another link',
            },
          ],
          founded: '2000-09-20',
          dissolved: '2001-09-20',
          legacyData: {
            drupalId: 19,
          },
          publicFunder: true,
          grantsFunded: [
            {
              from: {
                name: 'test organization 19',
              },
              to: {
                name: 'test organization 18',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 19',
              },
              to: {
                name: 'test organization 20',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 18',
              },
              to: {
                name: 'test organization 19',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 20',
              },
              to: {
                name: 'test organization 19',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
            {
              name: 'test ntee organization type 4',
              code: 'test ntee organization type code 4',
              description: 'test ntee organization type 4 description',
            },
          ],
          organizationTags: [
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
            {
              name: 'test organization tag 4',
              description: 'test organization tag 4 description',
            },
          ],
        },
      },
      {
        totalFunded: '40',
        totalReceived: '40',
        grantdatesStart: '2001-02-02',
        grantdatesEnd: '2001-02-02',
        organization: {
          name: 'test organization 20',
          ein: '20',
          duns: '20',
          stateCorpId: '20',
          description: 'test organization 20 description!',
          address: {
            postalCode: '20',
          },
          links: [
            {
              url: 'ftp://20',
              description: 'a link',
            },
            {
              url: 'gopher://20',
              description: 'another link',
            },
          ],
          founded: '2000-10-21',
          dissolved: '2001-10-21',
          legacyData: {
            drupalId: 20,
          },
          publicFunder: false,
          grantsFunded: [
            {
              from: {
                name: 'test organization 20',
              },
              to: {
                name: 'test organization 19',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 20',
              },
              to: {
                name: 'test organization 21',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 19',
              },
              to: {
                name: 'test organization 20',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
                name: 'test organization 21',
              },
              to: {
                name: 'test organization 20',
              },
              dateFrom: '2001-02-02',
              dateTo: '2010-02-02',
              amount: 20,
              source: 'grant 1 source',
              description: 'grant 1 description',
              internalNotes: 'grant 1 internal notes',
              legacyData: {
                drupalId: 1,
              },
              federalAwardId: 'grant 1 federal award id',
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
            {
              name: 'test ntee organization type 4',
              code: 'test ntee organization type code 4',
              description: 'test ntee organization type 4 description',
            },
          ],
          organizationTags: [
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
            {
              name: 'test organization tag 4',
              description: 'test organization tag 4 description',
            },
          ],
        },
      },
    ],
  },
};
