require('dotenv').config();
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection');
const config = require('../../config/DBconfig.json');

async function deleteSQLData() {

    for (let j = 0; j < (config[0]['sql'][1]['Tables']).length; j++) {
        let table = config[0]['sql'][1]['Tables'][j];
        _ = await getPool().request().query(`use ${SQL_DBNAME} delete from ${Object.values(table['MTDTable']['name'])}`);
    };

}


async function dropSQLTables() {

    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let count = tables.length
    let tablenames = tables.map((t, i) => ({ name: t.MTDTable.name.sqlName, index: i, drop: false }))
    while (tablenames.some(t => t.drop === false)) {
        for (let tbname of tablenames) {
            try {
                _ = await getPool().request().query(`use ${SQL_DBNAME}  drop  table IF EXISTS dbo.${tbname.name} `);
                tbname.drop = true
            }
            catch (error) {
                console.log(error.message)
                throw error
            }

        }
    }

}

// const addColumnToTable = async (tablename, { sqlName }, sqlType) => {
//     try {
//         const response = await getPool().request().query(`USE ${SQL_DBNAME}
//         IF NOT EXISTS
//         (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName} AND COLUMN_NAME=${sqlName}') 
//          ALTER TABLE ${tablename} ADD ${sqlName} ${sqlType} `)
//         return response.recordset
//     }
//     catch (error) {
//         throw error
//     }
// }

const insertColumn = async function (obj) {
    // console.log(obj);
    try {
        _ = await getPool().request().query(`use ${SQL_DBNAME} IF NOT EXISTS
    (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${obj.tableName} AND COLUMN_NAME=${obj.columns.name}') 
    ALTER TABLE ${obj.tableName} ADD ${obj.column.name} ${obj.column.type}
    ELSE PRINT('NO')`)
        return 'success_column'
    }
    catch (error) {
        throw error
    }
}



const createSQLTable = async function (obj) {
    try {
        let str = ''
        obj.columns.forEach(element => {
            str += `${element.name} ${element.type},`
        });
        _ = await getPool().request().query(`use ${SQL_DBNAME} IF NOT EXISTS
     (SELECT * FROM sys.tables WHERE name = '${obj.MTDTable.name.sqlName}') 
     CREATE TABLE [dbo].[${obj.MTDTable.name.sqlName}](${str})
     ELSE PRINT('NO')`)
        return 'success'
    }
    catch (error) {
        throw error
    }
}


module.exports = {
    createSQLTable,
    insertColumn,
    dropSQLTables,
    deleteSQLData,

}

