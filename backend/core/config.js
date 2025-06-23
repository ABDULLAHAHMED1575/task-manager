require('dotenv').config();

const PORT=process.env.PORT;
const HOST=process.env.HOST;
const CORSORIGIN = process.env.CORSORIGIN

module.exports = {
  PORT,
  HOST,
  CORSORIGIN
};