export const query = `
query news {
  organizations(limit: 1) {
    name
    boardTerms {
      dateTo
      dateFrom
      source
      compensation
      position
      person {
        name
      }
    }
  }
}
`;

export const expected = {
  data: {
    organizations: [
      {
        name: 'test organization 0',
        boardTerms: [
          {
            dateTo: '2005-02-02',
            dateFrom: '2003-02-02',
            source: 'board term 1 source',
            compensation: '1000',
            position: 'board term 1 position',
            person: {
              name: 'person 0 name',
            },
          },
          {
            dateTo: '2005-03-03',
            dateFrom: '2003-03-03',
            source: 'board term 2 source',
            compensation: '2000',
            position: 'board term 2 position',
            person: {
              name: 'person 1 name',
            },
          },
          {
            dateTo: '2005-04-04',
            dateFrom: '2003-04-04',
            source: 'board term 3 source',
            compensation: '3000',
            position: 'board term 3 position',
            person: {
              name: 'person 2 name',
            },
          },
          {
            dateTo: '2005-05-05',
            dateFrom: '2003-05-05',
            source: 'board term 4 source',
            compensation: '4000',
            position: 'board term 4 position',
            person: {
              name: 'person 3 name',
            },
          },
          {
            dateTo: '2005-06-06',
            dateFrom: '2003-06-06',
            source: 'board term 5 source',
            compensation: '5000',
            position: 'board term 5 position',
            person: {
              name: 'person 4 name',
            },
          },
          {
            dateTo: '2005-07-07',
            dateFrom: '2003-07-07',
            source: 'board term 6 source',
            compensation: '6000',
            position: 'board term 6 position',
            person: {
              name: 'person 5 name',
            },
          },
          {
            dateTo: '2005-08-08',
            dateFrom: '2003-08-08',
            source: 'board term 7 source',
            compensation: '7000',
            position: 'board term 7 position',
            person: {
              name: 'person 6 name',
            },
          },
          {
            dateTo: '2005-09-09',
            dateFrom: '2003-09-09',
            source: 'board term 8 source',
            compensation: '8000',
            position: 'board term 8 position',
            person: {
              name: 'person 7 name',
            },
          },
          {
            dateTo: '2005-10-10',
            dateFrom: '2003-10-10',
            source: 'board term 9 source',
            compensation: '9000',
            position: 'board term 9 position',
            person: {
              name: 'person 8 name',
            },
          },
          {
            dateTo: '2005-11-11',
            dateFrom: '2003-11-11',
            source: 'board term 10 source',
            compensation: '10000',
            position: 'board term 10 position',
            person: {
              name: 'person 9 name',
            },
          },
          {
            dateTo: '2005-01-12',
            dateFrom: '2003-01-12',
            source: 'board term 11 source',
            compensation: '11000',
            position: 'board term 11 position',
            person: {
              name: 'person 10 name',
            },
          },
          {
            dateTo: '2005-02-13',
            dateFrom: '2003-02-13',
            source: 'board term 12 source',
            compensation: '12000',
            position: 'board term 12 position',
            person: {
              name: 'person 11 name',
            },
          },
          {
            dateTo: '2005-03-14',
            dateFrom: '2003-03-14',
            source: 'board term 13 source',
            compensation: '13000',
            position: 'board term 13 position',
            person: {
              name: 'person 12 name',
            },
          },
          {
            dateTo: '2005-04-15',
            dateFrom: '2003-04-15',
            source: 'board term 14 source',
            compensation: '14000',
            position: 'board term 14 position',
            person: {
              name: 'person 13 name',
            },
          },
          {
            dateTo: '2005-05-16',
            dateFrom: '2003-05-16',
            source: 'board term 15 source',
            compensation: '15000',
            position: 'board term 15 position',
            person: {
              name: 'person 14 name',
            },
          },
          {
            dateTo: '2005-06-17',
            dateFrom: '2003-06-17',
            source: 'board term 16 source',
            compensation: '16000',
            position: 'board term 16 position',
            person: {
              name: 'person 15 name',
            },
          },
          {
            dateTo: '2005-07-18',
            dateFrom: '2003-07-18',
            source: 'board term 17 source',
            compensation: '17000',
            position: 'board term 17 position',
            person: {
              name: 'person 16 name',
            },
          },
          {
            dateTo: '2005-08-19',
            dateFrom: '2003-08-19',
            source: 'board term 18 source',
            compensation: '18000',
            position: 'board term 18 position',
            person: {
              name: 'person 17 name',
            },
          },
          {
            dateTo: '2005-09-20',
            dateFrom: '2003-09-20',
            source: 'board term 19 source',
            compensation: '19000',
            position: 'board term 19 position',
            person: {
              name: 'person 18 name',
            },
          },
        ],
      },
    ],
  },
};
