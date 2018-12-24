import * as config from 'config';
import * as Sequelize from 'sequelize';
import { parse as urlParse } from 'url';

import { logger as baseLogger } from '../../logger';

import form990Factory, * as form990 from './form990';
import grantTagFactory, * as grantTag from './grantTag';
import organizationTagFactory, * as organizationTag from './organizationTag';
import nteeGrantTypeFactory, * as nteeGrantType from './nteeGrantType';
import nteeOrganizationTypeFactory, * as nteeOrganizationType from './nteeOrganizationType';
import grantFactory, * as grant from './grant';
import newsFactory, * as news from './news';
import organizationFactory, * as organization from './organization';
import organizationMetaFactory, * as organizationMeta from './organizationMeta';

export interface Db {
  Form990: Sequelize.Model<form990.Form990Instance, form990.Form990Attributes>;
  Grant: Sequelize.Model<grant.GrantInstance, grant.GrantAttributes>;
  GrantTag: Sequelize.Model<
    grantTag.GrantTagInstance,
    grantTag.GrantTagAttributes
  >;
  News: Sequelize.Model<news.NewsInstance, news.NewsAttributes>;
  NteeGrantType: Sequelize.Model<
    nteeGrantType.NteeGrantTypeInstance,
    nteeGrantType.NteeGrantTypeAttributes
  >;
  NteeOrganizationType: Sequelize.Model<
    nteeOrganizationType.NteeOrganizationTypeInstance,
    nteeOrganizationType.NteeOrganizationTypeAttributes
  >;
  Organization: Sequelize.Model<
    organization.OrganizationInstance,
    organization.OrganizationAttributes
  >;
  OrganizationMeta: Sequelize.Model<
    organizationMeta.OrganizationMetaInstance,
    organizationMeta.OrganizationMetaAttributes
  >;
  OrganizationTag: Sequelize.Model<
    organizationTag.OrganizationTagInstance,
    organizationTag.OrganizationTagAttributes
  >;
  sequelize: Sequelize.Sequelize;
  Sequelize: Sequelize.SequelizeStatic;
}

export default function dbFactory(): Db {
  const logger = baseLogger.child({ module: 'database' });
  let dbConfig = config.get('database') as Sequelize.Options;

  dbConfig.logging = msg => logger.debug(msg);

  logger.info('setting up database with dialect %s', dbConfig.dialect);

  if (process.env.DATABASE_URL) {
    const parsed = urlParse(process.env.DATABASE_URL);
    if (!parsed) {
      throw new Error('cannot prase DATABASE_URL');
      process.exit(1);
    }

    dbConfig = {
      ...dbConfig,
      host: parsed.hostname || '',
      port: parseInt(parsed.port || '0'),
      database: parsed.path && parsed.path.replace('/', ''),
      username: parsed.auth && parsed.auth.split(':')[0],
      password: parsed.auth && parsed.auth.split(':')[1],
    } as Sequelize.Options;
  }

  const sequelize = new Sequelize(dbConfig);

  const db: Db = {
    Form990: form990Factory(sequelize),
    Grant: grantFactory(sequelize),
    GrantTag: grantTagFactory(sequelize),
    News: newsFactory(sequelize),
    NteeGrantType: nteeGrantTypeFactory(sequelize),
    NteeOrganizationType: nteeOrganizationTypeFactory(sequelize),
    Organization: organizationFactory(sequelize),
    OrganizationMeta: organizationMetaFactory(sequelize),
    OrganizationTag: organizationTagFactory(sequelize),
    sequelize,
    Sequelize,
  };

  Object.values(db.sequelize.models).forEach(
    (model: Sequelize.Model<any, any>) => {
      if (model.associate) {
        model.associate(db.sequelize.models);
      }
    }
  );

  return db;
}
