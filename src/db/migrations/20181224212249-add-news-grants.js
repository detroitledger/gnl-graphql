module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('news_grants', {
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
      grant_id: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'grant',
          key: 'id',
        },
        primaryKey: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down(queryInterface) {
    return queryInterface.dropTable('news_grants');
  },
  info: {
    revision: 1,
    name: 'create news_grants',
    created: '2018-12-24T21:25:30.159Z',
  },
};
