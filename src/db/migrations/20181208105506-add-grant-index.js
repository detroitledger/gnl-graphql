module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(`
      create index if not exists grant_from_idx on "grant" ("from");
      create index if not exists grant_to_idx on "grant" ("to");
    `);
  },

  down: queryInterface => {
    return queryInterface.sequelize.query(`
      drop index if exists grant_from_idx;
      drop index if exists grant_to_idx;
    `);
  },
};
