# gnl-graphql
graphql server for detroitledger.org

Reference docs: http://dev.apollodata.com/tools/

## Install
`npm install`

## Config

Copy `sample.env` to `.env`, set up connection

## Use
`npm start`

Got to http://localhost:8080/graphiql to use GraphiQL query interface

Sample query:
```graphql
{
  organization(ein: "380808800") {
    ein
    program_service_revenue
    forms990(limit: 3, offset: 3) {
      id
      ein
      tax_period
      total_assets
    }
    ledgerOrganizations {
      ...orgFields
    }
    ledgerGrants(limit: 3, offset: 3) {
      id
      ein
      amount
      start
      end
      funder {
        ...orgFields
      }
      recipient {
        ...orgFields
      }
    }
    ledgerNewsArticles {
      id
      link
      date
      desc
      organization {
        ...orgFields
      }
    }
  }
}

fragment orgFields on LedgerOrganization {
  name
  description
  id
  ein
  stateCorpId
  funded
  received
  start
  end
  ntees {
    id
    name
  }
}
```
