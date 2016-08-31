import casual from 'casual';

const mocks = {
	String: () => 'Hello world',
	Query: () => ({
		organization: (root, args) => {
			return { ein: args.ein }
		},
	}),
	Organization: () => ({
		orgId: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
		name: () => casual.company_name,
	}),
	Grant: () => ({
		id: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
	}),
	NewsArticle: () => ({
		id: () => casual.integer(1, 10000),
		ein: () => casual.integer(1, 100000000),
		desc: () => casual.sentences(5),
		data: () => casual.date,
		link: () => casual.url,
	}),
};

export default [mocks];
