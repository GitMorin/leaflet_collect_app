// we require the connection here, not knex!

const knex = require('./knex');
const knexPostgis = require('knex-postgis');
const st = knexPostgis(knex);

const db = knex({
  dialect: 'postgres'
});

const allPois = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, place, comments, regdate, numbers) As l)) As properties FROM poi As lg   ) As f )  As fc;"

module.exports = {
  getAll() {
    // retrun all rows in pois table
    return knex.raw(allPois)
  },
  getOne(id){
    return knex('poi').where('id', id).first();
  },

  //TODO: Make dynamic

  create() {
    const sql = db.insert({
      geom: st.geomFromText('Point(-71.064544 44.28787)', 4326)
    }).into('poi');
    return sql
  },
  update(id, poi) {
    return knex('poi').where('id', id).update(poi, '*');
  },
  delete(id) {
    return knex('poi').where('id', id).del();
  },
};
