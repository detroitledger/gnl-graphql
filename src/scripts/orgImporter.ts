import * as fs from 'fs';
import * as Sequelize from 'sequelize';

import {
  AbstractDrupalTagAttributes,
  AbstractDrupalTagInstance,
} from '../db/models/abstractDrupalTag';

import {
  OrganizationAttributes,
  Address,
  LegacyData,
  Link,
} from '../db/models/organization';

import dbFactory, * as models from '../db/models';

const { Op } = Sequelize;

export const db = dbFactory() as models.Db;

const DATADIR = `${
  process.env.HOME
}/gnl/data.detroitledger.org/profiles/gnl_profile/exporters`;

export const orgs = require(`${DATADIR}/orgs.json`).orgs;

export const findTag = async (
  model: Sequelize.Model<
    AbstractDrupalTagInstance,
    AbstractDrupalTagAttributes
  >,
  drupalId: number
): Promise<AbstractDrupalTagInstance | null> => {
  const existingTag = await model.findOne({ where: { drupalId } });

  return existingTag;
};

export const checkTagsExist = async (
  model: Sequelize.Model<
    AbstractDrupalTagInstance,
    AbstractDrupalTagAttributes
  >,
  sourceField: string
) => {
  for (const drupalOrg of orgs) {
    if (drupalOrg[sourceField] != null) {
      try {
        for (const tid of Object.keys(drupalOrg[sourceField].und)) {
          const existingTag = await model.findOne({ where: { drupalId: tid } });
          if (!existingTag) {
            console.warn('oh shit', { drupalOrg });
            return false;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return true;
};

const importOrg = async drupalOrg => {
  const cleansed = {
    name: drupalOrg.title,
    ein: drupalOrg.field_ein,
    duns: drupalOrg.field_duns != 0 ? drupalOrg.field_duns : null,
    stateCorpId: drupalOrg.field_state_corp_id
      ? drupalOrg.field_state_corp_id.value
      : null,
    // org ntee codes multi
    // org tags multi
    description: drupalOrg.body && drupalOrg.body.und[0].value,
    address: drupalOrg.field_org_address
      ? ({
          countryCode: drupalOrg.field_org_address.country,
          administrativeArea: drupalOrg.field_org_address.administrative_area,
          locality: drupalOrg.field_org_address.locality,
          dependentLocality: drupalOrg.field_org_address.dependent_locality,
          postalCode: drupalOrg.field_org_address.postal_code,
          addressLine1: drupalOrg.field_org_address.thoroughfare,
          addressLine2: drupalOrg.field_org_address.premise,
          organization: drupalOrg.field_org_address.organisation_name,
          givenName: drupalOrg.field_org_address.first_name,
          familyName: drupalOrg.field_org_address.last_name,
        } as Address)
      : null,
    links:
      drupalOrg.field_org_links &&
      (drupalOrg.field_org_links.map(link => ({
        description: link.title,
        url: link.url,
      })) as Link),
    founded: makeDateonly(drupalOrg.field_org_lifespan, 'value'),
    dissolved: makeDateonly(drupalOrg.field_org_lifespan, 'value2'),
    publicFunder:
      drupalOrg.field_publicfunder && drupalOrg.field_publicfunder.value == '1',
    legacyData: {
      drupalId: drupalOrg.id,
      clientProject: drupalOrg.field_client_project
        ? drupalOrg.field_client_project.und[
            Object.keys(drupalOrg.field_client_project.und)[0]
          ].name
        : null,
    } as LegacyData,
    uuid: drupalOrg.uuid,
  } as OrganizationAttributes;

  const org = await db.Organization.create(cleansed);

  // Tags
  if (
    drupalOrg.field_org_tags &&
    Object.keys(drupalOrg.field_org_tags.und).length > 0
  ) {
    const tags = await db.OrganizationTag.findAll({
      where: {
        drupalId: {
          [Op.in]: Object.keys(drupalOrg.field_org_tags.und),
        },
      },
    });

    // Dumb guard
    if (org.setOrganizationTags) {
      await org.setOrganizationTags(tags);
    }
  }

  // NTEE codes
  if (
    drupalOrg.field_ntee &&
    Object.keys(drupalOrg.field_ntee.und).length > 0
  ) {
    const ntees = await db.NteeOrganizationType.findAll({
      where: {
        drupalId: {
          [Op.in]: Object.keys(drupalOrg.field_ntee.und),
        },
      },
    });

    // Dumb guard
    if (org.setNteeOrganizationTypes) {
      await org.setNteeOrganizationTypes(ntees);
    }
  }

  return org;
};

function makeDateonly(field, subfield): Date | null {
  if (!field || !field[subfield]) return null;

  const year = field[subfield].substring(0, 4);
  const month = field[subfield].substring(5, 7);
  const day = field[subfield].substring(8, 10);

  return new Date(year, month, day);
}

export const doImport = async () => {
  const allTagsExist = await checkTagsExist(
    db.OrganizationTag,
    'field_org_tags'
  );
  console.log({ allTagsExist });
  if (!allTagsExist) process.exit(1);

  const allNteeOrganizationTypesExist = await checkTagsExist(
    db.NteeOrganizationType,
    'field_ntee'
  );
  console.log({ allNteeOrganizationTypesExist });
  if (!allNteeOrganizationTypesExist) process.exit(1);

  const org = await importOrg(orgs[0]);

  for (const drupalOrg of orgs) {
    await importOrg(drupalOrg);
  }
};

doImport();
