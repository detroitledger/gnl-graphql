# gnl-graphql
graphql server for detroitledger.org

Built using:

* https://github.com/prisma/graphql-yoga
* https://github.com/mickhansen/graphql-sequelize
* https://github.com/mickhansen/dataloader-sequelize

## Install

`yarn install`

## Config

We use the `config` package to manage our configurations. See `config/default.toml`.

## Set up databases

Create a postgres db that matches the info in `config/default.toml` or alternatively set up your
own configuration overrides in `config/local.toml`.

Use the latest seed db from [here](https://drive.google.com/open?id=1QdYUUWB7CEtRknPqL5Ku_89PvKEYKLIn)

```
zcat snake_cased.sql.gz | psql gnl
```

or on OS X, `gzcat snake_cased.sql.gz | psql gnl`

Create a GNL user:

```
CREATE USER gnl;
GRANT CONNECT ON DATABASE gnl TO gnl;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gnl;
```

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

Another sample query:
```graphql
query {
  organizationMetas(
    organizationNameILike: "%foundation%"
    orderByMulti: [["totalFunded", "DESC NULLS LAST"]]
  ) {
    totalFunded
    totalReceived
    organization {
      name
    }
  }
}
```

## Connecting to a client

Tinkered with connecting this server to a simple Apollo/React client app here: https://github.com/jessicamcinchak/frontpage-react-app/tree/ledger-client
