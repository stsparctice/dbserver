require('dotenv').config();
const { SQL_SERVER, SQL_DBNAME, SQL_USERNAME, SQL_PASSWORD, SQL_PORT } = process.env;
const sql = require('mssql');

const poolConfig = () => ({
    // driver: SQL_PORT,
    port: parseInt(SQL_PORT),
    server: SQL_SERVER,
    // database: SQL_DBNAME,
    user: SQL_USERNAME,
    password: SQL_PASSWORD,
    database: 'master',
    options: {
        encrypt: false,
        enableArithAbort: false
    }
});


let pool;
const connectSql = async () => {
    if (!poolConfig().server || !poolConfig().user || !poolConfig().password) {
        throw new Error('.env file is not valid or is not exsist.')
    }
    if (!pool) {

        pool = new sql.ConnectionPool(poolConfig());
        // console.log(pool);
    }
    if (!pool.connected) {
        // console.log(new Date().toISOString())
        // console.log({connected: pool.connected})
        _ = await pool.connect();
        // console.log({connected: pool.connected})
    }
}

const getPool = () => {
    return pool
};

module.exports = {
    getPool,
    connectSql
};
