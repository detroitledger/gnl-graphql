import * as fs from 'fs';
import * as Sequelize from 'sequelize';

import {
  AbstractDrupalTagAttributes,
  AbstractDrupalTagInstance,
} from '../db/models/abstractDrupalTag';

import dbFactory, * as models from '../db/models';

export const db = dbFactory() as models.Db;

const DATADIR =
  '/Users/bc/gnl/data.detroitledger.org/profiles/gnl_profile/exporters';

export const orgs = require(`${DATADIR}/orgs.json`).orgs;


export const findTag = async (
  model: Sequelize.Model<AbstractDrupalTagInstance, AbstractDrupalTagAttributes>,
  drupalId: number
): Promise<AbstractDrupalTagInstance|null> => {
  const existingTag = await model.findOne({ where: { drupalId } });

  return existingTag;
};

export const checkTagsExist = async (
  model: Sequelize.Model<AbstractDrupalTagInstance, AbstractDrupalTagAttributes>,
  sourceField: string
) => {
  for (const drupalOrg of orgs) {
    if (drupalOrg[sourceField] != null) {
      try {
        for (const tid of Object.keys(drupalOrg[sourceField].und)) {
          const existingTag = await model.findOne({ where: { drupalId: tid }});
          if (!existingTag) {
            console.warn('oh shit', { drupalOrg });
            return false;
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  return true;
};

export const doImport = async () => {
  const allTagsExist = await checkTagsExist(db.OrganizationTag, 'field_org_tags');
  console.log({ allTagsExist })
  if (!allTagsExist) process.exit(1);
  
  const allNteeOrganizationTypesExist = await checkTagsExist(db.NteeOrganizationType, 'field_ntee');
  console.log({ allNteeOrganizationTypesExist })
  if (!allNteeOrganizationTypesExist) process.exit(1);

/*
  for (const drupalOrg of orgs) {
    const cleansed = {
      name: drupalOrg.title,
      ein: drupalOrg.field_ein,
      duns: drupalOrg.field_duns != 0 ? drupalOrg.field_duns : null,
      stateCorpId: drupalOrg.field_state_corp_id
        ? drupalOrg.field_state_corp_id.value
        : null,
      // org ntee codes multi
      // org tags multi
      description: drupalOrg.body.und[0].value,
      address: drupalOrg.,
      links: drupalOrg.,
      founded: drupalOrg.,
      dissolved: drupalOrg.,
      legacyData: drupalOrg.,
      publicFunder: drupalOrg.,
    };

    //await db.Organization.create(cleansed);
  }
*/
};


doImport();
