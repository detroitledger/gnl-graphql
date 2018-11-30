'use strict';

const getMigrationCommands = Sequelize => [
  {
    fn: 'createTable',
    params: [
      'GrantTags',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
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
        drupalId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'NteeGrantTypes',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
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
        drupalId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'Organizations',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        ein: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        duns: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        stateCorpId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        address: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        links: {
          type: Sequelize.JSON,
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
        legacyData: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        publicFunder: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'OrganizationTags',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
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
        drupalId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'NteeOrganizationTypes',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
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
        drupalId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'Grants',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          defaultValue: Sequelize.UUIDV4,
        },
        from: {
          type: Sequelize.UUIDV4,
          references: {
            model: 'Organizations',
            key: 'id',
          },
          allowNull: false,
        },
        to: {
          type: Sequelize.UUIDV4,
          references: {
            model: 'Organizations',
            key: 'id',
          },
          allowNull: false,
        },
        dateFrom: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dateTo: {
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
        internalNotes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        legacyData: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        federalAwardId: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
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
      'OrganizationNteeOrganizationType',
      {
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        OrganizationId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'Organizations',
            key: 'id',
          },
          primaryKey: true,
        },
        NteeOrganizationTypeId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'NteeOrganizationTypes',
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
      'OrganizationOrganizationTag',
      {
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        OrganizationId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'Organizations',
            key: 'id',
          },
          primaryKey: true,
        },
        OrganizationTagId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'OrganizationTags',
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
      'GrantNteeGrantType',
      {
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        GrantId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'Grants',
            key: 'id',
          },
          primaryKey: true,
        },
        NteeGrantTypeId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'NteeGrantTypes',
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
      'GrantGrantTag',
      {
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        GrantId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'Grants',
            key: 'id',
          },
          primaryKey: true,
        },
        GrantTagId: {
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'GrantTags',
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
    params: ['GrantTags'],
  },
  {
    fn: 'dropTable',
    params: ['OrganizationTags'],
  },
  {
    fn: 'dropTable',
    params: ['NteeGrantTypes'],
  },
  {
    fn: 'dropTable',
    params: ['NteeOrganizationTypes'],
  },
  {
    fn: 'dropTable',
    params: ['Grants'],
  },
  {
    fn: 'dropTable',
    params: ['Organizations'],
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
