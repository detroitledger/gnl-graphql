const resolvers = {
	Query: {
		organization(root, args) {
			return {};
		},
	},
	Organization: {
		forms990(organization) {
			return {};
		},
		* grants(org) {
			yield 'whatever';
		},
		newsArticles(organization) {
			return {};
		},
	},
	Form990: {
		organization(forms990) {
			return {};
		},
	},
	Grant: {
		organization(grants) {
			return {};
		},
	},
	NewsArticle: {
		organization(newsArticles) {
			return {};
		},
	},
};

export default resolvers;

