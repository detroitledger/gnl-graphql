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

import {
  checkTagsExist,
  findTag,
  makeDateonly,
  setTagfield,
} from './importHelpers';

const { Op } = Sequelize;

export const db = dbFactory() as models.Db;

const DATADIR = `${
  process.env.HOME
}/gnl/data.detroitledger.org/profiles/gnl_profile/exporters`;

export const orgs = require(`${DATADIR}/orgs.json`).orgs;

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
  await setTagfield(
    drupalOrg.field_org_tags,
    db.OrganizationTag,
    org,
    'setOrganizationTags'
  );

  // NTEE codes
  await setTagfield(
    drupalOrg.field_ntee,
    db.NteeOrganizationType,
    org,
    'setNteeOrganizationTypes'
  );

  return org;
};

export const doImport = async () => {
  const allTagsExist = await checkTagsExist(
    db.OrganizationTag,
    'field_org_tags',
    orgs
  );
  console.log({ allTagsExist });
  if (!allTagsExist) process.exit(1);

  const allNteeOrganizationTypesExist = await checkTagsExist(
    db.NteeOrganizationType,
    'field_ntee',
    orgs
  );
  console.log({ allNteeOrganizationTypesExist });
  if (!allNteeOrganizationTypesExist) process.exit(1);

  for (const drupalOrg of orgs) {
    await importOrg(drupalOrg);
  }
};

doImport();
