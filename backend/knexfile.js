const config = require('./core/config');
module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: {
        rejectUnauthorized: false, 
      },
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: {
        rejectUnauthorized: false, 
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: {
        rejectUnauthorized: false, 
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
