require('dotenv').config()

const options = {
    client: process.env.DB_CLIENT,
    version: process.env.DB_CLIENT_VERSION,
    connection: {
        host : process.env.DB_HOST,
        user : process.env.DB_USER,
        password : process.env.DB_PASS,
        database : process.env.DB_DATABASE,
    }
};

const connection = require('knex')(options);

module.exports = {
  knex: connection
};