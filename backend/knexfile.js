const config = require('./core/config');
module.exports = {
  development: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: false,
    },
    migrations: {
      tableName: 'taskmanager_3iih',
    },
  },

  staging: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'taskmanager_3iih',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: config.DB_URI,
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'taskmanager_3iih',
    },
  },
};
