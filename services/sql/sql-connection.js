require('dotenv').config();
const { SQL_SERVER, SQL_DBNAME, SQL_USERNAME, SQL_PASSWORD, SQL_PORT } = process.env;
const sql = require('mssql');

const poolConfig = () => ({
    driver: SQL_PORT,
    server: SQL_SERVER,
    database: SQL_DBNAME,
    user: SQL_USERNAME,
    password: SQL_PASSWORD,
    options: {
        encrypt: false,
        enableArithAbort: false
    }
});

let pool;

const connect = async () => {
    if (!pool) {
        pool = new sql.ConnectionPool(poolConfig());
    }
    if (!pool.connected) {
        _ = await pool.connect();
    }
}

const getPool = () => pool;

module.exports = {
    getPool,
    connect
};
