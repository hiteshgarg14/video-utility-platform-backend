const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  [process.env.NODE_ENV]: {
    dialect: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },
};
