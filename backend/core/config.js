require('dotenv').config();

const PORT=process.env.PORT;
const HOST=process.env.HOST;
const CORSORIGIN = process.env.CORSORIGIN;
const DB_URI = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
const SECRET_SESSION_KEY = process.env.SECRET_SESSION_KEY;
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS;

module.exports = {
  PORT,
  HOST,
  CORSORIGIN,
  DB_URI,
  NODE_ENV,
  SECRET_SESSION_KEY,
  BCRYPT_ROUNDS,
};