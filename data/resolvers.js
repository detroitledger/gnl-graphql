const resolvers = {
  Query: {
    organization(root, args, context) {
      return context.connectors.Organization.get(args.ein);
    },
  },
  Organization: {
    forms990(organization, args, context) {
      return context.connectors.Organization.forms990(organization.ein, args.limit, args.offset);
    },
    * grants(root, args) {
      let { limit } = args;
      while (limit--) {
        yield {};
      }
    },
    * newsArticles(root, args) {
      let { limit } = args;
      while (limit--) {
        yield {};
      }
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
