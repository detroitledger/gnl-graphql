import * as Sequelize from 'sequelize';

import { NewsAttributes } from '../db/models/news';

import {
  makeDateonly,
} from './importHelpers';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const news = require(`../../tmp/news.json`).newss;

const importNews = async drupalNews => {
  console.log("Trying", drupalNews)
  const org = await db.Organization.find({
    where: {
      legacyData: { drupalId: parseInt(drupalNews.field_news_org.target_id) },
    },
  });

  if (org == null) {
    console.error('no org??');
    console.log({ drupalNews });
    process.exit(1);
  }

  const cleansed = {
    uuid: drupalNews.uuid,
    org: org ? org.id : 'ts is confused',

    title: drupalNews.title,
    description: drupalNews.notes,
    link: drupalNews.notes,
    date: makeDateonly(drupalNews.field_year, 'value'),
  } as NewsAttributes;

  let news;
  try {
    news = await db.News.create(cleansed);
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
