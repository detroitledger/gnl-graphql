import casual from 'casual';

const grantMockIterator = {};
grantMockIterator[Symbol.iterator] = function* iter() {
	let next = 0;
	while (next < 10) {
		next++;
		yield mocks.Grant();
	}
};

const mocks = {
	String: () => 'Hello world',
	Query: () => ({
		organization: (root, args) => {
			return { ein: args.ein };
		},
	}),
	Organization: () => ({
		orgId: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
		name: () => casual.company_name,
		grants: () => grantMockIterator,
	}),
	Form990: () => ({
		id: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
		irs_year: () => casual.year,
		tax_period: () => casual.date,
		total_revenue: () => casual.integer(1, 1000000000),
		total_expenses: () => casual.integer(1, 1000000000),
		total_assets: () => casual.integer(1, 1000000000),
	}),
	Grant: () => ({
		id: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
	}),
	NewsArticle: () => ({
		id: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
		desc: () => casual.sentences(5),
		date: () => casual.date,
		link: () => casual.url,
	}),
};

export default mocks;

