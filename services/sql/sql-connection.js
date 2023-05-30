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
        console.log("pool "+pool );
    }
    if (!pool.connected) {
        _ = await pool.connect();
        console.log("kkk "+_);
    }
}

const getPool = () => pool;
console.log("getpull "+getPool());

module.exports = {
    getPool,
    connect
};
