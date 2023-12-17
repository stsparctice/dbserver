require('dotenv').config();
const { SQL_SERVER,  SQL_USERNAME, SQL_PASSWORD, SQL_PORT } = process.env;
const sql = require('mssql');
const notifictions = require('../../config/serverNotifictionsConfig.json')

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
        throw notifictions.find(n => n.status == 509)
    }
    if (!pool) {

        pool = new sql.ConnectionPool(poolConfig());
    }
    if (!pool.connected) {
        _ = await pool.connect();
    }
}

const newTransaction = async () => {
    try {
        const transaction = new sql.Transaction(getPool());
        const statement = new sql.PreparedStatement(transaction);
        return { transaction, statement }
    }
    catch (error) {
        throw error
    }
}

const getPool = () => {
    return pool
};

module.exports = {
    getPool,
    connectSql,
    newTransaction
};
