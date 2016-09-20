import { Organization } from './connectors';

const resolvers = {
	Query: {
		organization(root, args) {
			return Organization.findAll({ where: args });
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
