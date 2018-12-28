module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface
      .addColumn('news_organizations', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
      })
      .then(() =>
        queryInterface.addColumn('news_organizations', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
        })
      );
  },
  down(queryInterface) {
    return queryInterface
      .removeColumn('news_organizations', 'created_at')
      .then(() =>
        queryInterface.removeColumn('news_organizations', 'updated_at')
      );
  },
  info: {
    revision: 1,
    name: 'create news_organizations boilerplate',
    created: '2018-12-30T18:24:00.361Z',
  },
};
