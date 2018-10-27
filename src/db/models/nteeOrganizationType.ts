import * as Sequelize from 'sequelize';

import { AbstractDrupalTagAttributes } from './abstractDrupalTag';

// https://nccs.urban.org/classification/national-taxonomy-exempt-entities
// https://nccs.urban.org/sites/all/nccs-archive/kbfiles/324/NTEE%20Two%20Page_2005.DOC
// http://www.guidestar.org/rxg/help/ntee-codes.aspx
export interface NteeOrganizationTypeAttributes extends AbstractDrupalTagAttributes {
  id?: string;
  name: string;
  code: string;
  description?: string;
  drupalId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NteeOrganizationTypeInstance = Sequelize.Instance<
  NteeOrganizationTypeAttributes
> &
  NteeOrganizationTypeAttributes;

export default (sequelize: Sequelize.Sequelize) =>
  sequelize.define<
    NteeOrganizationTypeInstance,
    NteeOrganizationTypeAttributes
  >('NteeOrganizationType', {
    id: {
      type: Sequelize.UUIDV4,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    code: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: true },
    drupalId: { type: Sequelize.INTEGER, allowNull: true },
  });
