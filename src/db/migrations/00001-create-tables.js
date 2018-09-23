'use strict';

const getMigrationCommands = Sequelize => ([{
        fn: "createTable",
        params: [
            "GrantTags",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "NteeGrantTypes",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "code": {
                    "type": Sequelize.STRING,
                    "allowNull": true
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Organizations",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "ein": {
                    "type": Sequelize.INTEGER,
                    "allowNull": true
                },
                "duns": {
                    "type": Sequelize.INTEGER,
                    "allowNull": true
                },
                "stateCorpId": {
                    "type": Sequelize.INTEGER,
                    "allowNull": true
                },
                "address": {
                    "type": Sequelize.JSON,
                    "allowNull": true
                },
                "links": {
                    "type": Sequelize.JSON,
                    "allowNull": true
                },
                "founded": {
                    "type": Sequelize.DATEONLY,
                    "allowNull": true
                },
                "dissolved": {
                    "type": Sequelize.DATEONLY,
                    "allowNull": true
                },
                "legacyData": {
                    "type": Sequelize.JSON,
                    "allowNull": true
                },
                "publicFunder": {
                    "type": Sequelize.BOOLEAN,
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrganizationTags",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "OrganizationId": {
                    "type": Sequelize.UUIDV4,
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Organizations",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "NteeOrganizationTypes",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "code": {
                    "type": Sequelize.STRING,
                    "allowNull": false
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "OrganizationId": {
                    "type": Sequelize.UUIDV4,
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Organizations",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Grants",
            {
                "id": {
                    "type": Sequelize.UUIDV4,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "from": {
                    "type": Sequelize.UUIDV4,
                    "references": {
                        "model": "Organizations",
                        "key": "id"
                    },
                    "allowNull": false
                },
                "to": {
                    "type": Sequelize.UUIDV4,
                    "references": {
                        "model": "Organizations",
                        "key": "id"
                    },
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "allowNull": false
                }
            },
            {}
        ]
    }
]);

const rollbackCommands = [{
        fn: "dropTable",
        params: ["GrantTags"]
    },
    {
        fn: "dropTable",
        params: ["OrganizationTags"]
    },
    {
        fn: "dropTable",
        params: ["NteeGrantTypes"]
    },
    {
        fn: "dropTable",
        params: ["NteeOrganizationTypes"]
    },
    {
        fn: "dropTable",
        params: ["Grants"]
    },
    {
        fn: "dropTable",
        params: ["Organizations"]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        let index = this.pos;
        const migrationCommands = getMigrationCommands(Sequelize);
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    down: function(queryInterface, Sequelize)
    {
        let index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < rollbackCommands.length)
                {
                    let command = rollbackCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: {
        "revision": 1,
        "name": "create all tables",
        "created": "2018-09-30T12:33:51.361Z",
        "comment": "creates tables for grant, organization, grantTag, organizationTag, nteeOrganizationType, and nteeGrantType"
    },
};
