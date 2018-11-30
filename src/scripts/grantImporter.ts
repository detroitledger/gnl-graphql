import * as Sequelize from 'sequelize';

import {
  AbstractDrupalTagAttributes,
  AbstractDrupalTagInstance,
} from '../db/models/abstractDrupalTag';

import { GrantAttributes, LegacyData } from '../db/models/grant';

import {
  checkTagsExist,
  findTag,
  makeDateonly,
  setTagfield,
} from './importHelpers';

import dbFactory, * as models from '../db/models';

const { Op } = Sequelize;

const db = dbFactory() as models.Db;

const DATADIR = `${
  process.env.HOME
}/gnl/data.detroitledger.org/profiles/gnl_profile/exporters`;

const grants = require(`${DATADIR}/grant.json`).grants;

const importGrant = async drupalGrant => {
  const from = await db.Organization.find({
    where: {
      legacyData: { drupalId: parseInt(drupalGrant.field_funder.target_id) },
    },
  });
  const to = await db.Organization.find({
    where: {
      legacyData: { drupalId: parseInt(drupalGrant.field_recipient.target_id) },
    },
  });

  if (from == null || to == null || from.id == null || to.id == null) {
    console.error('no from/to??');
    console.log({ drupalGrant });
    process.exit(1);
  }

  const cleansed = {
    uuid: drupalGrant.uuid,
    from: from ? from.id : 999999,
    to: to ? to.id : 999999,
    dateFrom: makeDateonly(drupalGrant.field_year, 'value'),
    dateTo: makeDateonly(drupalGrant.field_year, 'value2'),
    amount: drupalGrant.field_funded_amount,
    source: drupalGrant.field_source,
    description: drupalGrant.notes,
    internalNotes: drupalGrant.field_internal_notes,
    legacyData: {
      drupalId: drupalGrant.id,
      region: drupalGrant.field_region
        ? drupalGrant.field_region.und[
            Object.keys(drupalGrant.field_region.und)[0]
          ].name
        : null,
    } as LegacyData,
    federalAwardId: drupalGrant.field_federal_award_id
      ? drupalGrant.field_federal_award_id.value
      : null,
  } as GrantAttributes;

  let grant;

  try {
    grant = await db.Grant.create(cleansed);
  } catch (e) {
    console.error('cannot create grant');
    console.error(e);
    process.exit(1);
  }

  // Grant tags
  await setTagfield(
    drupalGrant.field_grant_tags,
    db.GrantTag,
    grant,
    'setGrantTags'
  );

  // NTEE codes
  await setTagfield(
    drupalGrant.field_grant_types,
    db.NteeGrantType,
    grant,
    'setNteeGrantTypes'
  );

  return grant;
};

export const doImport = async () => {
  const allTagsExist = await checkTagsExist(
    db.GrantTag,
    'field_grant_tags',
    grants
  );
  console.log({ allTagsExist });
  if (!allTagsExist) process.exit(1);

  const allNteeGrantTypesExist = await checkTagsExist(
    db.NteeGrantType,
    'field_grant_types',
    grants
  );
  console.log({ allNteeGrantTypesExist });
  if (!allNteeGrantTypesExist) process.exit(1);

  for (const drupalGrant of grants) {
    await importGrant(drupalGrant);
  }
};

doImport();
