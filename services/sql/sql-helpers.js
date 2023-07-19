require('dotenv').config();
const path = require('path')
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

//old config
    // let tables = config[0]['sql'][1]['Tables']
   
//new config
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let count = tables.length
    let tablenames = tables.map((t,i)=>({name:t.MTDTable.name.sqlName, index:i, drop:false}))
    while (tablenames.some(t=>t.drop===false)) {
        // console.log({count});
        for (let tbname of tablenames) {
            try {
                _ = await getPool().request().query(`use ${SQL_DBNAME}  drop  table IF EXISTS dbo.${tbname.name} `);
               tbname.drop = true
            //    console.log({tbname});
            }
            catch (error) {

                console.log(error.message)
            }

        }
    }
    
}

async function dropMongo(){

}

module.exports = { deleteSQLData, dropSQLTables }

