import * as fs from 'fs';
import * as Sequelize from 'sequelize';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const DATADIR =
  '/home/bc/gnl/data.detroitledger.org/profiles/gnl_profile/exporters';

const orgs = require(`${DATADIR}/orgs.json`).orgs;

const createBasicParser = (model: Sequelize.Model<any, any>) => (err, data) =>
  data.map(datum => model.create(datum));

const importOrg = async drupalOrg => {};
