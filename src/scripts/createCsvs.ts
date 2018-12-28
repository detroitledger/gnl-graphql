import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { to as copyTo } from 'pg-copy-streams';
import { Client } from 'pg';

import { buildDbConfig } from '../db/models';

const writeFile = promisify(fs.writeFile);
const dbConfig = buildDbConfig();

const client = new Client({
  ...dbConfig,
  user: dbConfig.username,
});

function main() {
  client.connect(async err => {
    if (err) {
      console.error('pg cannot create client');
      console.error(err);
      process.exit(1);
    }

    const uploadDir = path.resolve(__dirname, '..', 'csv-exports');
    try {
      fs.mkdirSync(uploadDir);
    } catch (e) {
      if (e.errno === -17) {
        console.log(`${uploadDir} already exists, continuing`);
      } else {
        console.error(e);
        process.exit(1);
      }
    }

    try {
      const organizationCsvPath = path.resolve(uploadDir, 'organization.csv');
      const orgdata = await generateCsv(
        client,
        'COPY (SELECT uuid, name, ein, duns, state_corp_id, description, address, links, founded, dissolved FROM organization) TO STDOUT WITH (format csv, header)'
      );
      await writeFile(organizationCsvPath, orgdata);

      const grantCsvPath = path.resolve(uploadDir, 'grant.csv');
      const grantData = await generateCsv(
        client,
        `COPY (SELECT g.uuid, orgfrom.uuid AS org_from_uuid, orgfrom.name AS org_from_name, orgto.uuid AS org_to_uuid, orgto.name AS org_to_name, g.date_from, g.date_to, g.amount, g.source, g.description, g.federal_award_id FROM "grant" g INNER JOIN organization orgfrom ON g.from=orgfrom.id INNER JOIN organization orgto ON g.to=orgto.id) TO STDOUT WITH (format csv, header)`
      );
      await writeFile(grantCsvPath, grantData);

      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}

const generateCsv = (client: Client, query: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = client.query(copyTo(query));
    let data = '';
    stream.on('data', chunk => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });

main();
