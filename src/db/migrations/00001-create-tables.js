'use strict';

const getMigrationCommands = Sequelize => [
  {
    fn: 'createTable',
    params: [
      'grant_tag',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        drupal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'ntee_grant_type',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        drupal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'organization',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        ein: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        duns: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        state_corp_id: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        address: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        links: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        founded: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dissolved: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        legacy_data: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        public_funder: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'organization_tag',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        drupal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'ntee_organization_type',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        drupal_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'grant',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        from: {
          type: Sequelize.INTEGER,
          references: {
            model: 'organization',
            key: 'id',
          },
          allowNull: false,
        },
        to: {
          type: Sequelize.INTEGER,
          references: {
            model: 'organization',
            key: 'id',
          },
          allowNull: false,
        },
        date_from: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        date_to: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        amount: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        source: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        internal_notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        legacy_data: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        federal_award_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'organization_ntee_organization_type',
      {
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
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
        ntee_organization_type_id: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'ntee_organization_type',
            key: 'id',
          },
          primaryKey: true,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'organization_organization_tag',
      {
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
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
        organization_tag_id: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'organization_tag',
            key: 'id',
          },
          primaryKey: true,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'grant_ntee_grant_type',
      {
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
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
        ntee_grant_type_id: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'ntee_grant_type',
            key: 'id',
          },
          primaryKey: true,
        },
      },
      {},
    ],
  },
  {
    fn: 'createTable',
    params: [
      'grant_grant_tag',
      {
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
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
        grant_tag_id: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'grant_tag',
            key: 'id',
          },
          primaryKey: true,
        },
      },
      {},
    ],
  },
];

const rollbackCommands = [
  {
    fn: 'dropTable',
    params: ['grant_tag'],
  },
  {
    fn: 'dropTable',
    params: ['ntee_grant_type'],
  },
  {
    fn: 'dropTable',
    params: ['organization'],
  },
  {
    fn: 'dropTable',
    params: ['organization_tag'],
  },
  {
    fn: 'dropTable',
    params: ['ntee_organization_type'],
  },
  {
    fn: 'dropTable',
    params: ['grant'],
  },
  {
    fn: 'dropTable',
    params: ['organization_ntee_organization_type'],
  },
  {
    fn: 'dropTable',
    params: ['organization_organization_tag'],
  },
  {
    fn: 'dropTable',
    params: ['grant_ntee_grant_type'],
  },
  {
    fn: 'dropTable',
    params: ['grant_grant_tag'],
  },
];

module.exports = {
  pos: 0,
  up: function(queryInterface, Sequelize) {
    let index = this.pos;
    const migrationCommands = getMigrationCommands(Sequelize);
    return new Promise(function(resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log('[#' + index + '] execute: ' + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  down: function(queryInterface, Sequelize) {
    let index = this.pos;
    return new Promise(function(resolve, reject) {
      function next() {
        if (index < rollbackCommands.length) {
          let command = rollbackCommands[index];
          console.log('[#' + index + '] execute: ' + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  info: {
    revision: 1,
    name: 'create all tables',
    created: '2018-09-30T12:33:51.361Z',
    comment:
      'creates tables for grant, organization, grantTag, organizationTag, nteeOrganizationType, and nteeGrantType',
  },
};
