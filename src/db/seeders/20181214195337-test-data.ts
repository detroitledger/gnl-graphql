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
  const aWholeLot = [...Array(1000).keys()];

  for (let organizationTag of aFew.map(
    i =>
      ({
        name: `test organization tag ${i}`,
        description: `test organization tag ${i} description`,
        drupalId: i,
      } as OrganizationTagAttributes)
  )) {
    await db.OrganizationTag.create(organizationTag);
  }

  for (let grantTag of aFew.map(
    i =>
      ({
        name: `test grant tag ${i}`,
        description: `test grant tag ${i} description`,
        drupalId: i,
      } as GrantTagAttributes)
  )) {
    await db.GrantTag.create(grantTag);
  }

  for (let nteeOrganizationType of aFew.map(
    i =>
      ({
        name: `test ntee organization type ${i}`,
        code: `test ntee organization type code ${i}`,
        description: `test ntee organization type ${i} description`,
        drupalId: i,
      } as NteeOrganizationTypeAttributes)
  )) {
    await db.NteeOrganizationType.create(nteeOrganizationType);
  }

  for (let nteeGrantType of aFew.map(
    i =>
      ({
        name: `test ntee grant type ${i}`,
        description: `test ntee grant type ${i} description`,
        drupalId: i,
      } as NteeGrantTypeAttributes)
  )) {
    await db.NteeGrantType.create(nteeGrantType);
  }

  let createdOrgs: OrganizationInstance[] = [];
  let createdGrants: GrantInstance[] = [];

  for (let organization of aBunch.map(
    i =>
      ({
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
          },
          {
            description: 'another link',
            url: `gopher://${i}`,
          },
        ] as Link[],
        founded: new Date(2000, i % 11, (i % 27) + 1),
        dissolved: new Date(2001, i % 11, (i % 27) + 1),
        legacyData: {
          drupalId: i,
        } as OrganizationLegacyData,
        publicFunder: !!(i % 2),
      } as OrganizationAttributes)
  )) {
    const createdOrg = await db.Organization.create(organization);

    const count = parseInt(createdOrg.ein || '1');

    createdOrgs[count] = createdOrg;

    const orgTags = await db.OrganizationTag.findAll({
      where: {
        drupalId: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdOrg.setOrganizationOrganizationTag) {
      await createdOrg.setOrganizationOrganizationTag(orgTags);
    }

    const orgNtees = await db.NteeOrganizationType.findAll({
      where: {
        drupalId: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdOrg.setOrganizationNteeOrganizationType) {
      await createdOrg.setOrganizationNteeOrganizationType(orgNtees);
    }
  }

  for (let form990 of aBunch.map(
    i =>
      ({
        ein: `${i}`,
        filing_type: '990',
        total_expenses: i * 100,
        total_revenue: i * 200,
        total_liabilities: i * 300,
        total_fundraising_expenses: i * 400,
        net_assets: i * 500,
      } as Form990Attributes)
  )) {
    for (let year of [1990, 1991, 1992, 1993, 1994, 1995]) {
      await db.Form990.create({
        ...form990,
        source: `${year} 990`,
        tax_period: `${year * 100 + 6}`,
        irs_year: year,
      });
    }
  }

  for (let grant of aWholeLot.map(
    i =>
      ({
        from: createdOrgs[Math.floor(i / 100) + 1].id,
        to: createdOrgs[Math.floor(i / 100) + 2].id,
        dateFrom: new Date(2001, i % 11, (i % 27) + 1),
        dateTo: new Date(2010, i % 11, (i % 27) + 1),
        amount: i,
        source: `grant ${i} source`,
        description: `grant ${i} description`,
        internalNotes: `grant ${i} internal notes`,
        legacyData: {
          drupalId: i,
        } as GrantLegacyData,
        federalAwardId: `grant ${i} federal award id`,
      } as GrantAttributes)
  )) {
    let createdGrant = await db.Grant.create(grant);

    const count = createdGrant.amount || 1;

    createdGrants[count] = createdGrant;

    const grantTags = await db.GrantTag.findAll({
      where: {
        drupalId: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdGrant.setGrantGrantTag) {
      await createdGrant.setGrantGrantTag(grantTags);
    }

    const grantNtees = await db.NteeGrantType.findAll({
      where: {
        drupalId: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdGrant.setGrantNteeGrantType) {
      await createdGrant.setGrantNteeGrantType(grantNtees);
    }
  }

  for (let news of aBunch.map(i => ({
    title: `news ${i} title`,
    description: `news ${i} description`,
    link: `news ${i} link`,
    date: new Date(Date.UTC(2000, i % 11, (i % 27) + 1)),
  }))) {
    let createdNews = await db.News.create(news);

    const count = createdNews.id || 1;

    const newsOrgs = await db.Organization.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdNews.setNewsOrganizations) {
      await createdNews.setNewsOrganizations(newsOrgs);
    }

    const newsGrants = await db.Grant.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    if (createdNews.setNewsGrants) {
      await createdNews.setNewsGrants(newsGrants);
    }
  }

  for (let person of aBunch.map(i => ({
    name: `person ${i} name`,
  }))) {
    let createdPerson = await db.Person.create(person);

    const count = createdPerson.id || 1;

    const orgs = await db.Organization.findAll({
      where: {
        id: {
          [Sequelize.Op.between]: [
            Math.floor(count / 10),
            Math.floor(count / 10 + 10),
          ],
        },
      },
    });

    for (const org of orgs) {
      await db.BoardTerm.create({
        person: count,
        organization: org.id || 1,
        dateFrom: new Date(),
        dateTo: new Date(),
        source: `board term ${count} source`,
        position: `board term ${count} position`,
        compensation: count * 1000,
      });
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
