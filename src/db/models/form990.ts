import * as Sequelize from 'sequelize';

export interface Form990Attributes {
  id?: number;
  source: string;
  org: number;
  ein: string;
  subseccd: string;
  pdf: string;
  filing_type: string;
  start_year: number;
  end_year: number;
  irs_year: number;
  filing_date: string;
  tax_period: string;
  contributions_and_grants: number;
  program_service_revenue: number;
  investment_income: number;
  other_revenue: number;
  total_revenue: number;
  grants_paid: number;
  benefits_paid: number;
  compensation: number;
  fundraising_fees: number;
  total_fundraising_expenses: number;
  other_expenses: number;
  total_expenses: number;
  revenue_less_expenses: number;
  total_assets: number;
  total_liabilities: number;
  net_assets: number;
  data?: object;
  createdAt?: string;
  updatedAt?: string;
}

export type Form990Instance = Sequelize.Instance<Form990Attributes> &
  Form990Attributes;

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<Form990Instance, Form990Attributes>(
    'Form990',
    {
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
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true,
      tableName: 'form_990',
    }
  );
