module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('news_organizations', {
      news_id: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'news',
          key: 'id',
        },
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'organization',
          key: 'id',
        },
        primaryKey: true,
      },
    });
  },
  down(queryInterface) {
    return queryInterface.dropTable('news_organizations');
  },
  info: {
    revision: 1,
    name: 'create news_organizations',
    created: '2018-12-30T15:50:00.361Z',
  },
};
