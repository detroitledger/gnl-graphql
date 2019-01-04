'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize
      .query(
        `
create unique index organization_meta_id on organization_meta (id)
`
      )
      .then(() =>
        queryInterface.sequelize.query(`
create or replace function refresh_organization_meta()
returns trigger language plpgsql
as $$
begin
    refresh materialized view concurrently organization_meta;
    return null;
end $$;
`)
      )
      .then(() =>
        queryInterface.sequelize.query(`
create trigger changed_grant
after insert or update or delete or truncate
on "grant" for each statement 
execute procedure refresh_organization_meta();
`)
      )
      .then(() =>
        queryInterface.sequelize.query(`
create trigger changed_organization
after insert or update or delete or truncate
on organization for each statement 
execute procedure refresh_organization_meta();
`)
      ),

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize
      .query(
        `
drop index if exists organization_meta_id
`
      )
      .then(() =>
        queryInterface.sequelize.query(`
drop function if exists refresh_organization_meta() cascade
`)
      ),
};
