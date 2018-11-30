# gnl-graphql
graphql server for detroitledger.org

Reference docs: http://dev.apollodata.com/tools/

## Install
`yarn install`

## Set up databases

By default the dev environment uses a sqlite database `devdb.sqlite` that is created in the project's root.

Initalize the database by running `yarn run sequelize db:migrate`

## Importing legacy data

TODO: real docs

Start from scratch & run an import:

```
rm devdb.sqlite
( yarn run sequelize db:migrate && yarn tsc && node dist/scripts/tagImporter.js && node dist/scripts/orgImporter.js && node dist/scripts/grantImporter.js ) | yarn bunyan -l ERROR
```

## Config

We use the `config` package to manage our configurations. See `config/default.toml`.

## Use
`yarn start`

Got to http://localhost:8080/graphiql to use GraphiQL query interface

Sample query:
```graphql
{
  irsOrganization(ein: "380808800") {
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
      ledgerOrganizations {
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
## Connecting to a client
Tinkered with connecting this server to a simple Apollo/React client app here: https://github.com/jessicamcinchak/frontpage-react-app/tree/ledger-client
