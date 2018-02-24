// we require the connection here, not knex!

const knex = require('./knex');
const knexPostgis = require('knex-postgis');
const st = knexPostgis(knex);

const db = knex({
  dialect: 'postgres'
});

const allPois = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, place, comments, regdate, numbers, asset_type) As l)) As properties FROM poi As lg   ) As f )  As fc;";
const getLast = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(ST_Transform(lg.geom,4326))::json As geometry , row_to_json((SELECT l FROM (SELECT id, place, comments, regdate, numbers, asset_type) As l)) As properties FROM poi As lg order by regdate desc limit 1 ) As f )  As fc;";

module.exports = {
  getAll() {
    // retrun all rows in pois table
    return knex.raw(allPois);
  },
  getOne(id) {
    return knex('poi').where('id', id).first();
  },
  getAllwkt() {
    return db.select('id', st.asText('geom')).from('poi');
  },
  // get latest
  getLatest() {
    return knex('poi').orderBy('regdate', 'asc').limit(1);
  },
  getLatestRaw() {
    // retrun all rows in pois table
    return knex.raw(getLast);
  },
  create(poi) {
    poi.geom = st.geomFromText(poi.geom, 4326);
    const sql = db.insert(poi).returning('*').into('poi');
    console.log(sql.toString());
    return sql;
},
  update(id, poi) {
    return knex('poi').where('id', id).update(poi, '*');
  },
  delete(id) {
    return knex('poi').where('id', id).del();
  },
  // create new tomming
  createTomming(tomming) {
    const sql = db.insert(tomming).returning('*').into('tomming');
    console.log(sql.toString());
    return sql;
        // create tomming with fk value of id
  },
  // get tomming for id
  getTomming(id) {
    const sql = knex.from('tomming')
    // .innerJoin('fyllingsgrad', 'regdato', 'poi.id', 'tomming.poi_id')
    //.innerJoin('*')
    .where('poi_id', id);
    console.log(sql.toString());
    return sql;
  },
  createSkade(skade) {
    const sql = db.insert(skade).returning('*').into('skader');
    console.log(sql.toString());
    return sql;
  },
  // get skade for id
  getSkade(id) {
    const sql = knex.from('skader')
    // .innerJoin('fyllingsgrad', 'regdato', 'poi.id', 'tomming.poi_id')
    //.innerJoin('*')
    .where('poi_id', id);
    console.log(sql.toString());
    return sql;
  },
};
