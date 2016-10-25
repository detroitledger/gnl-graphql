const typeDefinitions = [`
type Organization {
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
  ein: Int
  irs_year: String
  tax_period: String
  total_revenue: Int
  total_expenses: Int
  total_assets: Int
  organization: Organization
}

type LedgerGrant {
  id: Int
  ein: Int
  funder: LedgerOrganization
  recipient: LedgerOrganization
  start: String
  end: String
  amount: Int
  organization: Organization
}

type LedgerOrganization {
  id: Int
  ein: Int
  name: String
  description: String
  organization: Organization
}

type LedgerNewsArticle {
  id: Int
  ein: Int
  desc: String
  date: String
  link: String
  organization: Organization
}

type Query {
  organization(ein: String): Organization
}

schema {
  query: Query
}
`];

export default typeDefinitions;
