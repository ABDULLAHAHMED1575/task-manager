const knex = require('knex');
const config = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

if (!dbConfig) {
  throw new Error(`❌ No Knex config found for environment: ${environment}`);
}

const db = knex(dbConfig);

module.exports = db;