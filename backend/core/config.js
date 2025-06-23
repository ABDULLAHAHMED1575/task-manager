require('dotenv').config();

const PORT=process.env.PORT;
const HOST=process.env.HOST;
const CORSORIGIN = process.env.CORSORIGIN;
const DB_URI = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  PORT,
  HOST,
  CORSORIGIN,
  DB_URI,
  NODE_ENV,
};