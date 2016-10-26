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
    ledgerOrganizations(root, args, context) {
      return context.connectors.Ledger.organizations(root.ein, args.limit, args.offset);
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
    funder(root, args, context) {
      return context.connectors.Ledger.organization(root.funder.id);
    },
    recipient(root, args, context) {
      return context.connectors.Ledger.organization(root.recipient.id);
    },
  },
  LedgerNewsArticle: {
    organization(root, args, context) {
      return root.relatedOrgIds.map((id) => context.connectors.Ledger.organization(id));
    },
  },
  LedgerOrganization: {
    ntees(root, args, context) {
      return root.nteeIds.map((id) => context.connectors.Ledger.ntee(id));
    },
  },
};

export default resolvers;
