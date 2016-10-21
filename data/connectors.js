import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export class OrganizationConnector {

  constructor() {
    this.db = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      dialect: 'postgres',
      dialectOptions: {
        ssl: (process.env.PG_SSLMODE === 'require') ? true : false,
      },
    });

    this.OrganizationModel = this.db.define('organization', {
      source: Sequelize.STRING(50),
      org: Sequelize.BIGINT,
      ein: Sequelize.STRING(50),
      subseccd: Sequelize.STRING(50),
      pdf: Sequelize.STRING(255),
      filing_type: Sequelize.STRING(50),
      start_year: Sequelize.INTEGER,
      end_year: Sequelize.INTEGER,
      irs_year: Sequelize.INTEGER,
      filing_date: Sequelize.STRING(25),
      tax_period: Sequelize.STRING(25),
      contributions_and_grants: Sequelize.BIGINT,
      program_service_revenue: Sequelize.BIGINT,
      investment_income: Sequelize.BIGINT,
      other_revenue: Sequelize.BIGINT,
      total_revenue: Sequelize.BIGINT,
      grants_paid: Sequelize.BIGINT,
      benefits_paid: Sequelize.BIGINT,
      compensation: Sequelize.BIGINT,
      fundraising_fees: Sequelize.BIGINT,
      total_fundraising_expenses: Sequelize.BIGINT,
      other_expenses: Sequelize.BIGINT,
      total_expenses: Sequelize.BIGINT,
      revenue_less_expenses: Sequelize.BIGINT,
      total_assets: Sequelize.BIGINT,
      total_liabilities: Sequelize.BIGINT,
      net_assets: Sequelize.BIGINT,
      data: Sequelize.JSONB,
    }, {
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      tableName: 'combined',
    });
  }

  get(ein) {
    return this.db.models.organization.find({ where: { ein } });
  }

  forms990(ein, limit, offset) {
    return this.db.models.organization.findAll({
      where: {
        ein,
      },
      limit,
      offset,
    });
  }

}

