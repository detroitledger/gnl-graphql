import * as Sequelize from 'sequelize';

import { NewsAttributes } from '../db/models/news';
import { GrantInstance } from '../db/models/grant';
import { OrganizationInstance } from '../db/models/organization';

import { makeDateonly } from './importHelpers';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const news = require(`../../tmp/news.json`).newss;

const importNews = async drupalNews => {
  const cleansed = {
    uuid: drupalNews.uuid,
    title: drupalNews.title,
    description: drupalNews.field_news_desc,
    link: drupalNews.field_news_link,
    date: drupalNews.field_news_date,
  } as NewsAttributes;

  let news;
  try {
    news = await db.News.create(cleansed);

    // Assoicate with Grants
    let grants: GrantInstance[] = [];
    if (drupalNews.field_news_grant) {
      for (let drupalGrant of drupalNews.field_news_grant) {
        const grant = await db.Grant.find({
          where: {
            legacyData: { drupalId: parseInt(drupalGrant.target_id) },
          },
        });
        if (grant) grants = [...grants, grant];
      }
    }

    await news.setNewsGrants(grants);

    // Assoicate with Orgs
    let orgs: OrganizationInstance[] = [];
    if (drupalNews.field_news_org) {
      for (let drupalOrg of drupalNews.field_news_org) {
        const org = await db.Organization.find({
          where: {
            legacyData: { drupalId: parseInt(drupalOrg.target_id) },
          },
        });
        if (org) orgs = [...orgs, org];
      }
    }

    await news.setNewsOrganizations(orgs);
  } catch (e) {
    console.error('ERROR');
    console.error('cannot create news');
    console.error(e);
    process.exit(1);
  }

  return news;
};

export const doImport = async () => {
  for (const drupalNews of news) {
    await importNews(drupalNews);
  }
};

doImport()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('ERROR');
    console.error(e);
    process.exit(1);
  });
