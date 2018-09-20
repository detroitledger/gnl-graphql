import { difference } from 'lodash';

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
    funder(root, args, context, info) {
      // Can we use the preloaded data?
      if (orgQueryIsSimple(info)) {
        return root.funder
      }

      return context.connectors.Ledger.organization(root.funder.id);
    },
    recipient(root, args, context, info) {
      // Can we use the preloaded data?
      if (orgQueryIsSimple(info)) {
        return root.recipient;
      }

      return context.connectors.Ledger.organization(root.recipient.id);
    },
  },
  LedgerNewsArticle: {
    ledgerOrganizations(root, args, context) {
      return root.relatedOrgIds.map((id) => context.connectors.Ledger.organization(id));
    },
  },
  LedgerOrganization: {
    ntees(root, args, context, info) {
      if (nteeQueryIsSimple(info)) {
        return Object.values(root.ntees).map((ntee) => ({name: ntee.name, id: ntee.tid}));
      }

      return root.nteeIds.map((id) => context.connectors.Ledger.ntee(id));
    },
    ledgerGrantsFunded(ledgerOrganization, args, context) {
      return context.connectors.Ledger.grantsFunded(ledgerOrganization.id, args.limit, args.offset);
    },
    ledgerGrantsReceived(ledgerOrganization, args, context) {
      return context.connectors.Ledger.grantsReceived(ledgerOrganization.id, args.limit, args.offset);
    },
    forms990(ledgerOrganization, args, context) {
      return context.connectors.IrsDb.forms990(String(ledgerOrganization.ein), args.limit, args.offset);
    },
    ledgerNewsArticles(ledgerOrganization, args, context) {
      return ledgerOrganization.newsArticles;
    },
  },
};

function orgQueryIsSimple(info) {
  const sels = info.fieldASTs[0].selectionSet.selections;

  // Only name and target_id are preloaded, so a query involving over 2 fields (plus __typename) is not eligible.
  if (sels.length > 3) {
    return false;
  }

  const names = sels.map((sel) => sel.name.value);

  // Ensure the only requested fields are the preloaded ones.
  return difference(names, ['__typename', 'name', 'id']).length === 0;
}

function nteeQueryIsSimple(info) {
  const sels = info.fieldASTs[0].selectionSet.selections;

  // Only name and target_id are preloaded, so a query involving over 2 fields (plus __typename) is not eligible.
  if (sels.length > 3) {
    return false;
  }

  const names = sels.map((sel) => sel.name.value);

  // Ensure the only requested fields are the preloaded ones.
  return difference(names, ['__typename', 'name', 'id']).length === 0;
}

export default resolvers;
