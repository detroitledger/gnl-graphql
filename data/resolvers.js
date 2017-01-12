const resolvers = {
  Query: {
    irsOrganization(root, args, context) {
      return context.connectors.IrsDb.get(args.ein);
    },
    ledgerOrganization(root, args, context) {
      return context.connectors.Ledger.organization(args.id);
    },
  },
  IrsOrganization: {
    forms990(irsOrganization, args, context) {
      return context.connectors.IrsDb.forms990(irsOrganization.ein, args.limit, args.offset);
    },
    ledgerGrants(irsOrganization, args, context) {
      return context.connectors.Ledger.grantsByEin(irsOrganization.ein, args.limit, args.offset);
    },
    ledgerNewsArticles(irsOrganization, args, context) {
      return context.connectors.Ledger.newsArticlesByEin(irsOrganization.ein, args.limit, args.offset);
    },
    ledgerOrganizations(irsOrganization, args, context) {
      return context.connectors.Ledger.organizationsByEin(irsOrganization.ein, args.limit, args.offset);
    },
  },
  Form990: {
    irsOrganization(forms990) {
      return {};
    },
  },
  LedgerGrant: {
    funder(root, args, context) {
      return context.connectors.Ledger.organization(root.funder.id);
    },
    recipient(root, args, context) {
      return context.connectors.Ledger.organization(root.recipient.id);
    },
  },
  LedgerNewsArticle: {
    ledgerOrganizations(root, args, context) {
      return root.relatedOrgIds.map((id) => context.connectors.Ledger.organization(id));
    },
  },
  LedgerOrganization: {
    ntees(root, args, context) {
      return root.nteeIds.map((id) => context.connectors.Ledger.ntee(id));
    },
    ledgerGrantsFunded(ledgerOrganization, args, context) {
      return context.connectors.Ledger.grantsFunded(ledgerOrganization.id, args.limit, args.offset);
    },
    ledgerGrantsReceived(ledgerOrganization, args, context) {
      return context.connectors.Ledger.grantsReceived(ledgerOrganization.id, args.limit, args.offset);
    },
  },
};

export default resolvers;
