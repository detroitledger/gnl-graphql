import * as Sequelize from 'sequelize';

import { makeDateonly } from './importHelpers';

import dbFactory, * as models from '../db/models';

const db = dbFactory() as models.Db;

const drupalPeople = require('../../person.json').persons;

const drupalBoardTerms = require('../../board_term.json').board_terms;

const importPerson = async drupalPerson => {
  await db.Person.create({
    name: drupalPerson.title,
    drupalId: drupalPerson.id,
    uuid: drupalPerson.uuid,
  });
};

const importBoardTerm = async drupalBoardTerm => {
  if (drupalBoardTerm.field_person) {
    const person = await db.Person.find({
      where: { drupalId: parseInt(drupalBoardTerm.field_person.target_id) },
    });

    const organization = await db.Organization.find({
      where: {
        legacyData: {
          drupalId: parseInt(drupalBoardTerm.field_organization.target_id),
        },
      },
    });

    if (person && person.id && organization && organization.id) {
      const boardTerm = await db.BoardTerm.create({
        person: person.id,
        organization: organization.id,
        dateFrom: makeDateonly(
          drupalBoardTerm.field_term_dates,
          'value'
        ) as Date,
        dateTo: makeDateonly(
          drupalBoardTerm.field_term_dates,
          'value2'
        ) as Date,
        source:
          drupalBoardTerm.field_board_source &&
          drupalBoardTerm.field_board_source.safe_value,
        position:
          drupalBoardTerm.field_position &&
          drupalBoardTerm.field_position.safe_value,
        compensation:
          drupalBoardTerm.field_compensation &&
          parseInt(drupalBoardTerm.field_compensation.value),
      });
    } else {
      console.error('missing person report');
      console.error({ drupalBoardTerm });
    }
  }
};

const doImport = async () => {
  for (const drupalPerson of drupalPeople) {
    await importPerson(drupalPerson);
  }

  for (const drupalBoardTerm of drupalBoardTerms) {
    await importBoardTerm(drupalBoardTerm);
  }
};

doImport()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('ERROR');
    console.error(e);
    process.exit(1);
  });
