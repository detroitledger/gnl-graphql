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
import organizationFactory, * as organization from './organization';
import organizationMetaFactory, * as organizationMeta from './organizationMeta';

export interface Db {
  sequelize: Sequelize.Sequelize;
  Sequelize: Sequelize.SequelizeStatic;
  Form990: Sequelize.Model<form990.Form990Instance, form990.Form990Attributes>;
  GrantTag: Sequelize.Model<
    grantTag.GrantTagInstance,
    grantTag.GrantTagAttributes
  >;
  OrganizationTag: Sequelize.Model<
    organizationTag.OrganizationTagInstance,
    organizationTag.OrganizationTagAttributes
  >;
  NteeGrantType: Sequelize.Model<
    nteeGrantType.NteeGrantTypeInstance,
    nteeGrantType.NteeGrantTypeAttributes
  >;
  NteeOrganizationType: Sequelize.Model<
    nteeOrganizationType.NteeOrganizationTypeInstance,
    nteeOrganizationType.NteeOrganizationTypeAttributes
  >;
  Grant: Sequelize.Model<grant.GrantInstance, grant.GrantAttributes>;
  Organization: Sequelize.Model<
    organization.OrganizationInstance,
    organization.OrganizationAttributes
  >;
  OrganizationMeta: Sequelize.Model<
    organizationMeta.OrganizationMetaInstance,
    organizationMeta.OrganizationMetaAttributes
  >;
}

export default function dbFactory(): Db {
  const logger = baseLogger.child({ module: 'database' });
  const dbConfig = config.get('database') as Sequelize.Options;

  dbConfig.logging = msg => logger.debug(msg);

  logger.info('setting up database with dialect %s', dbConfig.dialect);

  dbConfig.dialectOptions = {
    typeCast(field, next) {
      if (field.type === 'DATEONLY') {
        return field.string();
      }
      return next();
    },
  };

  if (process.env.DATABASE_URL) {
    const parsed = urlParse(process.env.DATABASE_URL);
    if (!parsed) {
      throw new Error('cannot prase DATABASE_URL');
      process.exit(1);
    }

    try {
      dbConfig.host = parsed.host || '';
      dbConfig.port = parseInt(parsed.port || '0');
      dbConfig.database = parsed.path && parsed.path.replace('/', '');
      dbConfig.username = parsed.auth && parsed.auth.split(':')[0];
      dbConfig.password = parsed.auth && parsed.auth.split(':')[1];
    } catch (e) {
      logger.error('cannot retrieve config from DATABASE_URL');
      process.exit(1);
    }
  }

  const sequelize = new Sequelize(dbConfig);

  const db: Db = {
    sequelize,
    Sequelize,
    Form990: form990Factory(sequelize),
    GrantTag: grantTagFactory(sequelize),
    OrganizationTag: organizationTagFactory(sequelize),
    NteeGrantType: nteeGrantTypeFactory(sequelize),
    NteeOrganizationType: nteeOrganizationTypeFactory(sequelize),
    Grant: grantFactory(sequelize),
    Organization: organizationFactory(sequelize),
    OrganizationMeta: organizationMetaFactory(sequelize),
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
