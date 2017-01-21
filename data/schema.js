const typeDefinitions = [`
type IrsOrganization {
  id: Int
  ein: String
  subsccd: String
  pdf: String
  filing_type: String
  start_year: Int
  end_year: Int
  irs_year: Int
  filing_date: String
  tax_period: String
  contributions_and_grants: Int
  program_service_revenue: Int
  investment_income: Int
  other_revenue: Int
  total_revenue: Int
  grants_paid: Int
  benefits_paid: Int
  compensation: Int
  fundraising_fees: Int
  total_fundraising_expenses: Int
  other_expenses: Int
  total_expenses: Int
  revenue_less_expenses: Int
  total_assets: Int
  total_liabilities: Int
  net_assets: Int
  data: String
  forms990(limit: Int = 5, offset: Int = 0): [Form990]
  ledgerOrganizations(limit: Int = 5, offset: Int = 0): [LedgerOrganization]
  ledgerGrants(limit: Int = 5, offset: Int = 0): [LedgerGrant]
  ledgerNewsArticles(limit: Int = 5, offset: Int = 0): [LedgerNewsArticle]
}

type Form990 {
  id: Int
  ein: String
  subsccd: String
  pdf: String
  filing_type: String
  start_year: Int
  end_year: Int
  irs_year: Int
  filing_date: String
  tax_period: String
  contributions_and_grants: Int
  program_service_revenue: Int
  investment_income: Int
  other_revenue: Int
  total_revenue: Int
  grants_paid: Int
  benefits_paid: Int
  compensation: Int
  fundraising_fees: Int
  total_fundraising_expenses: Int
  other_expenses: Int
  total_expenses: Int
  revenue_less_expenses: Int
  total_assets: Int
  total_liabilities: Int
  net_assets: Int
  data: String

  irsOrganization: IrsOrganization
}

type LedgerGrant {
  id: Int
  ein: Int
  funder: LedgerOrganization
  recipient: LedgerOrganization
  start: String
  end: String
  amount: Int
  description: String
}

type LedgerOrganization {
  id: Int
  ein: Int
  name: String
  description: String
  start: String
  end: String
  received: Int
  funded: Int
  stateCorpId: String
  ntees: [NteeCode]
  ledgerGrantsFunded(limit: Int = 5, offset: Int = 0): [LedgerGrant]
  ledgerGrantsReceived(limit: Int = 5, offset: Int = 0): [LedgerGrant]
  ledgerNewsArticles(limit: Int = 5, offset: Int = 0): [LedgerNewsArticle]
  forms990(limit: Int = 5, offset: Int = 0): [Form990]
}

type NteeCode {
  id: Int
  name: String
}

type LedgerNewsArticle {
  id: Int
  ein: Int
  title: String
  desc: String
  date: String
  link: String
  ledgerGrants: [LedgerGrant]
  ledgerOrganizations: [LedgerOrganization]
}

type Query {
  irsOrganization(ein: String): IrsOrganization
  ledgerOrganization(id: Int): LedgerOrganization
}

schema {
  query: Query
}
`];

export default typeDefinitions;
