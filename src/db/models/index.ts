import * as config from 'config';
import * as Sequelize from 'sequelize';

import { logger as baseLogger } from '../../logger';

import form990Factory from './form990';
import grantTagFactory from './grantTag';
import organizationTagFactory from './organizationTag';
import nteeGrantTypeFactory from './nteeGrantType';
import nteeOrganizationTypeFactory from './nteeOrganizationType';
import grantFactory from './grant';
import organizationFactory from './organization';

const logger = baseLogger.child({module: 'database'});
const dbConfig = config.get('database') as Sequelize.Options;
dbConfig.logging = (msg) => logger.debug(msg);
logger.info('setting up database with dialect %s', dbConfig.dialect);

const sequelize = new Sequelize(config.get('database'));

const db = {
  sequelize,
  Sequelize,
  GrantTag: grantTagFactory(sequelize),
  organizationTag: organizationTagFactory(sequelize),
  nteeGrantType: nteeGrantTypeFactory(sequelize),
  NteeOrganizationType: nteeOrganizationTypeFactory(sequelize),
  Grant: grantFactory(sequelize),
  Organization: organizationFactory(sequelize),
};

Object.values(db.sequelize.models).forEach((model: Sequelize.Model<any, any>) => {
  if (model.associate) {
    model.associate(db.sequelize.models);
  }
});

export default db;