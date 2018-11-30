import * as Sequelize from 'sequelize';

const { Op } = Sequelize;

import {
  AbstractDrupalTagAttributes,
  AbstractDrupalTagInstance,
} from '../db/models/abstractDrupalTag';

export const findTag = async (
  model: Sequelize.Model<
    AbstractDrupalTagInstance,
    AbstractDrupalTagAttributes
  >,
  drupalId: number
): Promise<AbstractDrupalTagInstance | null> => {
  const existingTag = await model.findOne({ where: { drupalId } });

  return existingTag;
};

export const checkTagsExist = async (
  model: Sequelize.Model<
    AbstractDrupalTagInstance,
    AbstractDrupalTagAttributes
  >,
  sourceField: string,
  orgs
) => {
  for (const drupalOrg of orgs) {
    if (drupalOrg[sourceField] != null) {
      try {
        for (const tid of Object.keys(drupalOrg[sourceField].und)) {
          const existingTag = await model.findOne({ where: { drupalId: tid } });
          if (!existingTag) {
            console.warn('oh shit', { drupalOrg });
            return false;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return true;
};

export const makeDateonly = (field, subfield): Date | null => {
  if (!field || !field[subfield]) return null;

  const year = field[subfield].substring(0, 4);
  const month = field[subfield].substring(5, 7);
  const day = field[subfield].substring(8, 10);

  return new Date(year, month, day);
};

export const setTagfield = async (
  drupalTagfield: any,
  model: Sequelize.Model<
    AbstractDrupalTagInstance,
    AbstractDrupalTagAttributes
  >,
  instance: Sequelize.Instance<any>,
  setterName: string
) => {
  if (drupalTagfield && Object.keys(drupalTagfield.und).length > 0) {
    const tags = await model.findAll({
      where: {
        drupalId: {
          [Op.in]: Object.keys(drupalTagfield.und),
        },
      },
    });

    // Dumb guard
    if (instance[setterName]) {
      await instance[setterName](tags);
    }
  }
};

