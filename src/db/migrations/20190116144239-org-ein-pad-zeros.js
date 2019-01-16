'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(`update organization set ein=null where ein='0'`)
      .then(() =>
        queryInterface.sequelize.query(
          `update organization set ein=lpad(ein, 9, '0')`
        )
      );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(`update organization set ein='0' where ein is null`)
      .then(() => `update organization set ein=trim(leading '0' from ein)`);
  },
};
