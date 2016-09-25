const typeDefinitions = [`
type Organization {
  id: Int
  ein: String
  forms990(limit: Int = 5, offset: Int = 0): [Form990]
  grants(limit: Int = 5, offset: Int = 0): [Grant]
  newsArticles(limit: Int = 5, offset: Int = 0): [NewsArticle]
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
  organization(ein: String): Organization
}

schema {
  query: Query
}
`];

export default typeDefinitions;
