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
  LegacyData as GrantLegacyData,
} from '../models/grant';

import dbFactory, * as models from '../models';

export const up = async (
  queryInterface: Sequelize.QueryInterface,
  Sequelize: Sequelize.Sequelize
) => {
  const db = dbFactory() as models.Db;

  const aHundred = [...Array(100).keys()];
  const aThousand = [...Array(1000).keys()];
  const tenThousand = [...Array(10000).keys()];

  for (let organizationTag of aHundred.map(
    i =>
      ({
        name: `test organization tag ${i}`,
        description: `test organization tag ${i} description`,
        drupalId: i,
      } as OrganizationTagAttributes)
  )) {
    await db.OrganizationTag.create(organizationTag);
  }

  for (let grantTag of aHundred.map(
    i =>
      ({
        name: `test grant tag ${i}`,
        description: `test grant tag ${i} description`,
        drupalId: i,
      } as GrantTagAttributes)
  )) {
    await db.GrantTag.create(grantTag);
  }

  for (let nteeOrganizationType of aHundred.map(
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

  for (let nteeGrantType of aHundred.map(
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

  for (let organization of aThousand.map(
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
        founded: new Date(i * 86400),
        dissolved: new Date(i * 86400 + 86400),
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

  for (let form990 of aThousand.map(
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

  for (let grant of tenThousand.map(
    i =>
      ({
        from: createdOrgs[Math.floor(i / 100) + 1].id,
        to: createdOrgs[Math.floor(i / 100) + 2].id,
        dateFrom: new Date(),
        dateTo: new Date(),
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

  return;
};