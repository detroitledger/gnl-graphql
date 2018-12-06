# gnl-graphql
graphql server for detroitledger.org

Built using:

* https://github.com/prisma/graphql-yoga
* https://github.com/mickhansen/graphql-sequelize
* https://github.com/mickhansen/dataloader-sequelize

## Install
`yarn install`

## Set up databases

Create a postgres db; maybe strat with a dump of the current latest imports.

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
`yarn tsc && PORT=3000 node dist/index.js`

Got to http://localhost:3000 for a [playground](https://github.com/prisma/graphql-playground)

Sample query:
```graphql
{
	query {
		organization(uuid: "03d9d71f-add5-4fe7-8701-67331a4dc795") {
			name
			uuid
			grantsFunded {
				uuid
				dateTo
				dateFrom
				to {
					name
					uuid
				}
				amount
				description
			}
			forms990 {
				start_year
				end_year
				irs_year
				total_assets
				total_revenue
				total_expenses
				total_liabilities
			}
		}
	}
}
```

## Connecting to a client

Tinkered with connecting this server to a simple Apollo/React client app here: https://github.com/jessicamcinchak/frontpage-react-app/tree/ledger-client
