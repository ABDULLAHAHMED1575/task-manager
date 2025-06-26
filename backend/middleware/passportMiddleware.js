const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const db = require('../core/db');
const config = require('../core/config');
const passport = require('../core/passport');
const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: config.DB_URI,
  ssl: {
    rejectUnauthorized: false,
  }
});

const sessionConfig = {
    store: new pgSession({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true,
        ttl: 24 * 60 * 60,
        disableTouch: false,
        schemaName: 'public',
    }),
    name: 'team_task_sid',
    secret: process.env.SECRET_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
    }
};

const setupPassport = (app) => {
    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());

    console.log("PassportJS initialized with session store");
}

module.exports = {
    setupPassport,
    passport
};