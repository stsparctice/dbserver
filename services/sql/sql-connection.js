require('dotenv').config();
const { SQL_SERVER, SQL_DBNAME, SQL_USERNAME, SQL_PASSWORD, SQL_PORT } = process.env;
const sql = require('mssql');

const poolConfig = () => ({
    driver: SQL_PORT,
    server: SQL_SERVER,
    database: SQL_DBNAME,
    user: SQL_USERNAME,
    password: SQL_PASSWORD,
    database:'master',
    options: {
        encrypt: false,
        enableArithAbort: false
    }
});

let pool;
console.log(poolConfig());
const connectSql = async () => {
    if (!pool) {

        pool = new sql.ConnectionPool(poolConfig());
        console.log("pool" );
    }
    if (!pool.connected) {
        _ = await pool.connect();
        console.log("connected");
    }
}

const getPool = () => pool;

module.exports = {
    getPool,
    connectSql
};
