require('dotenv').config();

const { getPool } = require('./sql-connection');
const { SQL_DBNAME } = process.env;
const {  getTableFromConfig } = require('../../modules/config/config')
const {getPrimaryKeyField, buildSqlCondition, parseSQLTypeForColumn, getAlias} = require('../../modules/public')
const notifictions = require('../../config/serverNotifictionsConfig.json');
const { convertToSqlCondition } = require('../../utils/convert_condition');

if (!SQL_DBNAME) {
     throw notifictions.find(n => n.status == 509)
}

const create = async function (obj) {
     const { tableName, columns, values } = obj;
     try {
          const primarykey = getPrimaryKeyField(tableName)
          console.log(`use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}) SELECT @@IDENTITY ${primarykey}`);
          const result = await getPool().request().query(`use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}) SELECT @@IDENTITY ${primarykey}`)
          return result.recordset;
     }

     catch (error) {
          throw error
     }

}



// obj:
// {
//      "tableName": "clients",
//      "column":
//      {
//           "name": "id",
//           "type": "INT IDENTITY PRIMARY KEY NOT NULL"
//      },
// }
// SELECT *
// FROM   INFORMATION_SCHEMA.COLUMNS
// WHERE  TABLE_NAME = 'Employees'
//  AND COLUMN_NAME = 'FirstName'
const insertColumn = async function (obj) {
     // console.log(obj);
     try {
          _ = await getPool().request().query(`use ${SQL_DBNAME} IF NOT EXISTS
     (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${obj.tableName} AND COLUMN_NAME=${OBJ.columns.name}') 
     ALTER TABLE ${obj.tableName} ADD ${obj.column.name} ${obj.column.type}
     ELSE PRINT('NO')`)
          return 'success_column'
     }
     catch (error) {
          throw error
     }
}


const createNewTable = async function (obj) {
     try {
          console.log({ obj });
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

const read = async function (obj) {
     try {
          if (!Object.keys(obj).includes("condition")) {
               obj.condition = '1=1';
          };
          if (!Object.keys(obj).includes("n")) {
               obj.n = 100;
          }
          const { tableName, columns, condition, n } = obj;


          console.log(`USE ${SQL_DBNAME} SELECT TOP ${n} ${columns} FROM ${tableName} AS ${getTableFromConfig(tableName).MTDTable.name.name} where ${condition}`);
          const result = await getPool().request().query(`USE ${SQL_DBNAME} SELECT TOP ${n} ${columns} FROM ${tableName} AS ${getAlias(tableName)} WHERE ${condition}`);
          return result.recordset;
     }
     catch (error) {
          console.log({ error });
          throw notifictions.find(({ status }) => status == 400);
     }
};

const readAll = async function (obj) {
     try {
          if (!Object.keys(obj).includes("condition")) {
               obj["condition"] = '1=1';
          };
          const { tableName, condition } = obj;
          const result = await getPool().request().query(`use ${SQL_DBNAME} select * from ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} where ${condition}`)
          return result.recordset;
     }
     catch (error) {
          console.log(error.message)
          throw error
     }
};

const join = async (query = "") => {
     try {
          const result = await getPool().request().query(query.trim());
          if (result.recordset) {
               return result.recordset;
          }
          return false;
     }
     catch (error) {
          throw error
     }
};


const update = async function (obj) {
     try {

          obj.condition = convertToSqlCondition(getTableFromConfig(obj.entityName), obj.condition)
          const alias = getTableFromConfig(obj.entityName).MTDTable.name.name
          const valEntries = Object.entries(obj.values);
          const updateValues = valEntries.map(c => `${alias}.${c[0]} =  ${parseSQLTypeForColumn({ name: c[0], value: c[1] }, obj.entityName)}`).join(',')
          const result = await getPool().request().query(`use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.entityName} ${alias} WHERE ${obj.condition}`)
          return result;
     }
     catch (error) {
          console.log(error)
          throw error
     }
};

const countRows = async function (obj) {
     try {
          const { tableName, condition } = obj;
          console.log({ func: 'countRows', tableName, condition })
          const result = await getPool().request().query(`use ${SQL_DBNAME} SELECT COUNT(*) as countRows FROM ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} WHERE ${condition}`)
          return result;
     }
     catch (error) {
          throw error
     }
}

async function drop(name){
     _ = await getPool().request().query(`use ${SQL_DBNAME}
     DROP TABLE ${name}`);
}
async function updateColumn(obj){
     console.log('update column');
     _ = await getPool().request().query(`use ${SQL_DBNAME}
     UPDATE ${obj.table}
     SET ${obj.column} = 1000`);


}
module.exports = {
     create,
     read,
     readAll,
     update,
     countRows,
     join,
     createNewTable,
     insertColumn,
     drop,
     updateColumn
}
