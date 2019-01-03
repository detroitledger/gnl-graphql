import * as Sequelize from 'sequelize';

import {
  checkTagsExist,
  findTag,
  makeDateonly,
  setTagfield,
} from '../../scripts/importHelpers';

import { OrganizationTagAttributes } from '../models/organizationTag';
import { GrantTagAttributes } from '../models/grantTag';
import { NteeOrganizationTypeAttributes } from '../models/nteeOrganizationType';
import { NteeGrantTypeAttributes } from '../models/nteeGrantType';
import { PersonAttributes } from '../models/person';
import { BoardTermAttributes } from '../models/boardTerm';
import { NewsAttributes } from '../models/news';

import {
  OrganizationAttributes,
  OrganizationInstance,
  Address,
  LegacyData as OrganizationLegacyData,
  Link,
} from '../models/organization';

import { Form990Attributes } from '../models/form990';

import {
  GrantAttributes,
  GrantInstance,
  LegacyData as GrantLegacyData,
} from '../models/grant';

import dbFactory, * as models from '../models';

export const up = async (
  queryInterface: Sequelize.QueryInterface,
  Sequelize: Sequelize.Sequelize
) => {
  const db = dbFactory() as models.Db;

  const aFew = [...Array(10).keys()];
  const aBunch = [...Array(100).keys()];

  for (let organizationTag of aFew.map(fakeOrganizationTag)) {
    await db.OrganizationTag.create(organizationTag);
  }

  for (let grantTag of aFew.map(fakeGrantTag)) {
    await db.GrantTag.create(grantTag);
  }

  for (let nteeOrganizationType of aFew.map(fakeNteeOrganizationType)) {
    await db.NteeOrganizationType.create(nteeOrganizationType);
  }

  for (let nteeGrantType of aFew.map(fakeNteeGrantType)) {
    await db.NteeGrantType.create(nteeGrantType);
  }

  // create a bunch of orgs
  for (let organization of aBunch.map(fakeOrganization)) {
    const createdOrg = await db.Organization.create(organization);

    const count = createdOrg.id || 1;
    console.log(`created org count ${count}`);

    // in each org, associate with count / 10 tags and ntee codes
    const orgTags = await db.OrganizationTag.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10) + 3,
          ],
        },
      },
    });

    if (createdOrg.setOrganizationOrganizationTag) {
      await createdOrg.setOrganizationOrganizationTag(orgTags);
    }

    const orgNtees = await db.NteeOrganizationType.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10) + 3,
          ],
        },
      },
    });

    if (createdOrg.setOrganizationNteeOrganizationType) {
      await createdOrg.setOrganizationNteeOrganizationType(orgNtees);
    }

    // Make a few forms 990 for this org
    for (let year of [1990, 1991, 1992, 1993, 1994, 1995]) {
      await db.Form990.create(fakeForm990(count, year));
    }

    // in each org, create c grants from and c grants to
    // other org is c-1 each grant
    // in each grant, associate with c tags and ntee codes
    let grantNum = Math.floor(count / 10);
    for (let grant of [...Array(grantNum).keys()].map(fakeGrant)) {
      const otherOrgId = count - grantNum;

      if (otherOrgId > 0 && count !== otherOrgId) {
        let createdGrantFrom = await db.Grant.create({
          ...grant,
          amount: grantNum * 10,
          from: count,
          to: otherOrgId,
        });

        let createdGrantTo = await db.Grant.create({
          ...grant,
          amount: grantNum * 10,
          to: count,
          from: otherOrgId,
        });

        const grantTags = await db.GrantTag.findAll({
          where: {
            id: {
              [Sequelize.Op.between]: [
                Math.floor(grantNum / 10),
                Math.floor(grantNum / 10) + 3,
              ],
            },
          },
        });

        if (
          createdGrantFrom.setGrantGrantTag &&
          createdGrantTo.setGrantGrantTag
        ) {
          await createdGrantFrom.setGrantGrantTag(grantTags);
          await createdGrantTo.setGrantGrantTag(grantTags);
        }

        const grantNtees = await db.NteeGrantType.findAll({
          where: {
            id: {
              [Sequelize.Op.between]: [
                Math.floor(grantNum / 10),
                Math.floor(grantNum / 10) + 3,
              ],
            },
          },
        });

        if (
          createdGrantFrom.setGrantNteeGrantType &&
          createdGrantTo.setGrantNteeGrantType
        ) {
          await createdGrantFrom.setGrantNteeGrantType(grantNtees);
          await createdGrantTo.setGrantNteeGrantType(grantNtees);
        }
      }
    }

    // Create count news entries related to this org
    for (let news of [...Array(count).keys()].map(fakeNews)) {
      let createdNews = await db.News.create({
        ...news,
        title: `news for organization ${count}`,
      });

      const newsOrgs = await db.Organization.findAll({
        where: {
          id: {
            [Sequelize.Op.between]: [count - 10, count],
          },
        },
      });

      if (createdNews.setNewsOrganizations && newsOrgs.length > 0) {
        await createdNews.setNewsOrganizations(newsOrgs);
      }

      const newsGrants = await db.Grant.findAll({
        where: {
          id: {
            [Sequelize.Op.between]: [count - 10, count],
          },
        },
      });

      if (createdNews.setNewsGrants && newsGrants.length > 0) {
        await createdNews.setNewsGrants(newsGrants);
      }
    }
  }

  // Create some people & board terms.
  for (let person of aBunch.map(fakePerson)) {
    let createdPerson = await db.Person.create(person);

    const count = createdPerson.id || 1;

    const orgs = await db.Organization.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 3),
          ],
        },
      },
    });

    for (const org of orgs) {
      await db.BoardTerm.create(fakeBoardTerm(count, org.id));
    }
  }

  await queryInterface.sequelize.query(
    'REFRESH MATERIALIZED VIEW organization_meta'
  );

  return;
};

export const down = async (
  queryInterface: Sequelize.QueryInterface,
  Sequelize: Sequelize.Sequelize
) => {
  await queryInterface.bulkDelete('organization_tag', {});
  await queryInterface.bulkDelete('grant_tag', {});
  await queryInterface.bulkDelete('ntee_organization_type', {});
  await queryInterface.bulkDelete('ntee_grant_type', {});
  await queryInterface.bulkDelete('organization', {});
  await queryInterface.bulkDelete('grant', {});
  await queryInterface.bulkDelete('board_term', {});
  await queryInterface.bulkDelete('person', {});

  return;
};

const fakeOrganizationTag = (i): OrganizationTagAttributes => ({
  name: `test organization tag ${i}`,
  description: `test organization tag ${i} description`,
  drupalId: i,
});

const fakeGrantTag = (i): GrantTagAttributes => ({
  name: `test grant tag ${i}`,
  description: `test grant tag ${i} description`,
  drupalId: i,
});

const fakeNteeOrganizationType = (i): NteeOrganizationTypeAttributes => ({
  name: `test ntee organization type ${i}`,
  code: `test ntee organization type code ${i}`,
  description: `test ntee organization type ${i} description`,
  drupalId: i,
});

const fakeNteeGrantType = (i): NteeGrantTypeAttributes => ({
  name: `test ntee grant type ${i}`,
  description: `test ntee grant type ${i} description`,
  drupalId: i,
});

const fakeOrganization = (i): OrganizationAttributes => ({
  name: `test organization ${i}`,
  ein: `${i}`,
  duns: `${i}`,
  stateCorpId: `${i}`,
  description: `test organization ${i} description!`,
  address: {
    postalCode: `${i}`,
  } as Address,
  links: [
    {
      description: 'a link',
      url: `ftp://${i}`,
    } as Link,
    {
      description: 'another link',
      url: `gopher://${i}`,
    } as Link,
  ],
  founded: new Date(2000, i % 11, (i % 27) + 1),
  dissolved: new Date(2001, i % 11, (i % 27) + 1),
  legacyData: {
    drupalId: i,
  } as OrganizationLegacyData,
  publicFunder: !!(i % 2),
});

const fakeForm990 = (i, year): Form990Attributes => ({
  ein: `${i}`,
  source: `${i} source`,
  org: i,
  subseccd: `${i}`,
  pdf: `${i}`,
  start_year: year,
  end_year: year,
  irs_year: year,
  filing_date: year,
  tax_period: `${year * 100 + 6}`,
  contributions_and_grants: i,
  program_service_revenue: i,
  investment_income: i,
  other_revenue: i,
  grants_paid: i,
  benefits_paid: i,
  compensation: i,
  fundraising_fees: i,
  other_expenses: i,
  revenue_less_expenses: i,
  total_assets: i,
  filing_type: '990',
  total_expenses: i * 100,
  total_revenue: i * 200,
  total_liabilities: i * 300,
  total_fundraising_expenses: i * 400,
  net_assets: i * 500,
});

const fakeGrant = (i): GrantAttributes => ({
  from: i,
  to: i,
  dateFrom: new Date(2001, i % 11, (i % 27) + 1),
  dateTo: new Date(2010, i % 11, (i % 27) + 1),
  amount: i * 100,
  source: `grant ${i} source`,
  description: `grant ${i} description`,
  internalNotes: `grant ${i} internal notes`,
  legacyData: {
    drupalId: i,
  } as GrantLegacyData,
  federalAwardId: `grant ${i} federal award id`,
});

const fakeNews = (i): NewsAttributes => ({
  title: `news ${i} title`,
  description: `news ${i} description`,
  link: `news ${i} link`,
  date: new Date(Date.UTC(2000, i % 11, (i % 27) + 1)),
});

const fakePerson = (i): PersonAttributes => ({
  name: `person ${i} name`,
});

const fakeBoardTerm = (i, orgId): BoardTermAttributes => ({
  person: i,
  organization: orgId || 1,
  dateFrom: new Date(2003, i % 11, (i % 27) + 1),
  dateTo: new Date(2005, i % 11, (i % 27) + 1),
  source: `board term ${i} source`,
  position: `board term ${i} position`,
  compensation: i * 1000,
});
