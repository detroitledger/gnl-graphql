import * as Sequelize from 'sequelize';

import { NewsAttributes } from '../db/models/news';

import { makeDateonly } from './importHelpers';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const news = require(`../../tmp/news.json`).newss;

const importNews = async drupalNews => {
  console.log('Trying', drupalNews);

  const cleansed = {
    uuid: drupalNews.uuid,
    title: drupalNews.title,
    description: drupalNews.notes,
    link: drupalNews.notes,
    date: makeDateonly(drupalNews.field_year, 'value'),
  } as NewsAttributes;

  let news;
  try {
    news = await db.News.create(cleansed);

    // Assoicate with Orgs
    const orgs = drupalNews.field_news_org.map(async ({ target_id }) => {
      console.log('Trying to associate with', target_id);
      const org = await db.Organization.find({
        where: {
          legacyData: { drupalId: parseInt(target_id) },
        },
      });
      return org;
    });
    console.log('Associating orgs with news', orgs);
    await news.setNewsOrganizations(orgs);
  } catch (e) {
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

doImport();
