const resolvers = {
	Query: {
		organization(root, args, context) {
			return context.connectors.Organization.get(args.ein);
		},
	},
	Organization: {
		forms990(root, args) {
			return {};
		},
		* grants(root, args) {
			yield 'whatever';
		},
		newsArticles(root, args) {
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
