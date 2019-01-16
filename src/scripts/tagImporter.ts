import * as fs from 'fs';
import * as config from 'config';
import * as csvParse from 'csv-parse';
import * as Sequelize from 'sequelize';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const DATADIR = `${
  process.env.HOME
}/gnl/data.detroitledger.org/profiles/gnl_profile/exporters`;

function doImport() {
  const promises = [
    {
      file: 'grantTag.csv',
      model: db.GrantTag,
    },
    {
      file: 'organizationTag.csv',
      model: db.OrganizationTag,
    },
    {
      file: 'nteeGrantType.csv',
      model: db.NteeGrantType,
    },
    {
      file: 'nteeOrganizationType.csv',
      model: db.NteeOrganizationType,
    },
  ].map(
    cfg =>
      new Promise((resolve, reject) => {
        const stream = fs
          .createReadStream(`${DATADIR}/${cfg.file}`)
          .pipe(csvParse({ delimiter: ',', columns: true }));

        stream.on('readable', async () => {
          let chunk;

          while (null !== (chunk = stream.read())) {
            await cfg.model.create(chunk);
          }

          resolve();
        });

        stream.on('error', reject);
      })
  );

  return Promise.all(promises);
}

doImport()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('ERROR');
    console.error(e);
    process.exit(1);
  });
