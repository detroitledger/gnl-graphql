'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('DROP MATERIALIZED VIEW public.organization_meta')
      .then(() => {
        queryInterface.sequelize.query(`
CREATE MATERIALIZED VIEW public.organization_meta
TABLESPACE pg_default
AS
 SELECT o.id,
    o.uuid,
    ( SELECT count(g.id) AS count
           FROM "grant" g
          WHERE g."from" = o.id) AS count_grants_from,
    ( SELECT count(g.id) AS count
           FROM "grant" g
          WHERE g."to" = o.id) AS count_grants_to,
    ( SELECT count(distinct(g."to")) FROM "grant" g
          WHERE g."from" = o.id) AS count_distinct_recipients,
    ( SELECT count(distinct(g."from")) FROM "grant" g
          WHERE g."to" = o.id) AS count_distinct_funders,
    ( SELECT sum(g.amount) AS sum
           FROM "grant" g
          WHERE g."to" = o.id
          GROUP BY o.id) AS total_received,
    ( SELECT sum(g.amount) AS sum
           FROM "grant" g
          WHERE g."from" = o.id
          GROUP BY o.id) AS total_funded,
    ( SELECT min(g.date_from) AS min
           FROM "grant" g
          WHERE g."from" = o.id OR g."to" = o.id
          GROUP BY o.id) AS grantdates_start,
    ( SELECT max(g.date_from) AS max
           FROM "grant" g
          WHERE g."from" = o.id OR g."to" = o.id
          GROUP BY o.id) AS grantdates_end
   FROM organization o
WITH DATA;
`);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query('DROP MATERIALIZED VIEW public.organization_meta')
      .then(() => {
        queryInterface.sequelize.query(`
CREATE MATERIALIZED VIEW public.organization_meta
TABLESPACE pg_default
AS
 SELECT o.id,
    o.uuid,
    ( SELECT sum(g.amount) AS sum
           FROM "grant" g
          WHERE g."to" = o.id
          GROUP BY o.id) AS total_received,
    ( SELECT sum(g.amount) AS sum
           FROM "grant" g
          WHERE g."from" = o.id
          GROUP BY o.id) AS total_funded,
    ( SELECT min(g.date_from) AS min
           FROM "grant" g
          WHERE g."from" = o.id OR g."to" = o.id
          GROUP BY o.id) AS grantdates_start,
    ( SELECT max(g.date_from) AS max
           FROM "grant" g
          WHERE g."from" = o.id OR g."to" = o.id
          GROUP BY o.id) AS grantdates_end
   FROM organization o
WITH DATA;
`);
      });
  },
};
