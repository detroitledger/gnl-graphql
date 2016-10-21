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

Sample query for organizations:
```graphql
{organization(ein:"200877805") {
  ein,
  id,
  subsccd,
  pdf,
  filing_type,
  start_year,
  end_year,
  irs_year,
  filing_date,
  tax_period,
  contributions_and_grants,
  program_service_revenue,
  investment_income,
  other_revenue,
  total_revenue,
  grants_paid,
  benefits_paid,
  compensation,
  fundraising_fees,
  total_fundraising_expenses,
  other_expenses,
  total_expenses,
  revenue_less_expenses,
  total_assets,
  total_liabilities,
  net_assets,
  data
}}
```
