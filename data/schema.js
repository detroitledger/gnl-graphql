const typeDefinitions = [`
type Organization {
	orgId: Int
	ein: Int
	name: String
	forms990: [Form990]
	grants: [Grant]
	newsArticles: [NewsArticle]
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

type Grant {
	id: Int
	ein: Int
	organization: Organization
}

type NewsArticle {
	id: Int
	ein: Int
	desc: String
	date: String
	link: String
	organization: Organization
}

type Query {
	organization(ein: Int): Organization
}

schema {
	query: Query
}
`];

export default typeDefinitions;