const mysql = require('mysql2/promise');



const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123qweasd',
  database: 'graphql_example'
};

const pool = mysql.createPool(dbConfig);

module.exports = { pool };