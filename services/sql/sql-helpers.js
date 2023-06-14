require('dotenv').config();
const path = require('path')
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection');
const config = require('../../config.json');

async function deleteData(){

    for (let j = 0; j < (config[0]['sql'][1]['Tables']).length; j++) {
        let table = config[0]['sql'][1]['Tables'][j];
        _ = await getPool().request().query(`use ${SQL_DBNAME} delete from ${Object.values(table['MTDTable']['name'])}`);
    };

}

module.exports = {deleteData}

