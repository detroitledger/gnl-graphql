import * as fs from 'fs';
import * as config from 'config';
import * as csvParse from 'csv-parse';
import * as Sequelize from 'sequelize';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const DATADIR =
  '/Users/bc/gnl/data.detroitledger.org/profiles/gnl_profile/exporters';

const createBasicParser = (model: Sequelize.Model<any, any>) => (err, data) =>
  data.map(datum => model.create(datum));

[
  {
    file: 'grantTag.csv',
    parser: createBasicParser(db.GrantTag),
  },
  {
    file: 'organizationTag.csv',
    parser: createBasicParser(db.OrganizationTag),
  },
  {
    file: 'nteeGrantType.csv',
    parser: createBasicParser(db.NteeGrantType),
  },
  {
    file: 'nteeOrganizationType.csv',
    parser: createBasicParser(db.NteeOrganizationType),
  },
].map(cfg =>
  fs
    .createReadStream(`${DATADIR}/${cfg.file}`)
    .pipe(csvParse({ delimiter: ',', columns: true }, cfg.parser))
);
