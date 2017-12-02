// will need a production connection when we deploy
const environment = process.env.NODE_ENV || 'development';

// the knex file
const config = require('../knexfile');
// envconfig att current environment
const environmentConfig = config[environment];
// require knex module
const knex = require('knex');
//const knexPostgis = require('knex-postgis');
// knex invoked with the environmentConfig
const connection = knex(environmentConfig);
// whenever we pass a configuration into knex, it creates a new db connection

// export connection from the file
module.exports = connection;

// module.exports = knex(environmentConfig);
