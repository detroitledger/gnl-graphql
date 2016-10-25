const resolvers = {
  Query: {
    organization(root, args, context) {
      return context.connectors.IrsDb.get(args.ein);
    },
  },
  Organization: {
    forms990(organization, args, context) {
      return context.connectors.IrsDb.forms990(organization.ein, args.limit, args.offset);
    },
    ledgerGrants(organization, args, context) {
      return context.connectors.Ledger.grants(organization.ein, args.limit, args.offset);
    },
    ledgerNewsArticles(organization, args, context) {
      return context.connectors.Ledger.newsArticles(organization.ein, args.limit, args.offset);
    },
    * ledgerOrganizations(root, args) {
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
  LedgerGrant: {
    organization(grants) {
      return {};
    },
    funder(root) {
      return {};
    },
    recipient(root) {
      return {};
    },
  },
  LedgerOrganization: {
    organization(grants) {
      return {};
    },
  },
  LedgerNewsArticle: {
    organization(ledgerNewsArticles) {
      return {};
    },
  },
};

export default resolvers;
