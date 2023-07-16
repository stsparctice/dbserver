require('dotenv').config();

const { getPool } = require('./sql-connection');
const { SQL_DBNAME } = process.env;
const { getPrimaryKeyField, buildSqlCondition, parseSQLTypeForColumn, getTableFromConfig } = require('../../modules/config/config')
const notifictions = require('../../config/serverNotifictionsConfig.json')

if (!SQL_DBNAME) {
     throw notifictions.find(n => n.status == 509)
}

const create = async function (obj) {
     const { tableName, columns, values } = obj;
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('columns', columns)
     //      .input('values', values)
     //      .execute(`pro_BasicCreate`);

     //      console.log({result})
     console.log({ tableName, columns, values })
     try {
          const primarykey = getPrimaryKeyField(tableName)
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



// obj:
// {
//      "MTDTable": {
//          "name": {
//              "name": "unitOfMeasure",
//              "sqlName": "tbl_unitOfMeasure"
//          },
//          "description": "a normalization table of unitsOfMeasure"
//      },
//      "columns": [
//          {
//              "name": "id",
//              "type": "INT IDENTITY PRIMARY KEY NOT NULL"
//          },
//          {
//              "name": "measure",
//              "type": "NVARCHAR(20) NOT NULL "
//          }
//      ]
//  },

const createNewTable = async function (obj) {
     try {
          // console.log(obj);
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
     }
     catch {
          throw notifictions.find(n => n.status == 400)
     }
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('columns', columns)
     //      .input('condition', condition)
     //      .input('n', n)
     //      .execute(`pro_BasicRead`);
     try {

          // console.log({ tableName, columns, condition, n })
          // console.log({ tableName, columns, condition, n })
          // const result = await getPool().request()
          //      .input('tableName', tableName)
          //      .input('columns', columns)
          //      .input('condition', condition)
          //      .input('n', n)
          //      .execute(`pro_BasicRead`);
          // console.log(`use ${SQL_DBNAME} select top ${n} ${columns} from ${tableName} where ${condition}`);
          const result = await getPool().request().query(`use ${SQL_DBNAME} select top ${n} ${columns} from ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} where ${condition}`);
          return result.recordset;
     }
     catch (error) {
          throw error
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

          obj.condition = buildSqlCondition(obj.tableName, obj.condition)
          const alias = getTableFromConfig(obj.tableName).MTDTable.name.name

          const valEntries = Object.entries(obj.values)
          const updateValues = valEntries.map(c => `${alias}.${c[0]} =  ${parseSQLTypeForColumn({ name: c[0], value: c[1] }, obj.tableName)}`).join(',')
          console.log(`use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.tableName} ${alias} WHERE ${obj.condition}`)
          const result = await getPool().request().query(`use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.tableName} ${alias} WHERE ${obj.condition}`)
          return result;
     }
     catch (error) {
          console.log(error.message)
          throw error
     }
};
const updateOne = async function (obj) {
     try {
          // const tableName = "tbl_Leads"

          const { tableName, values, condition } = obj;
          const tabledata = getSqlTableColumnsType(tableName)
          const result = await getPool().request().query(`use ${SQL_DBNAME} UPDATE ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} SET ${value} WHERE ${condition}`)
          return result;
     }
     catch (error) {
          throw error
     }
};
// 
const updateQuotation = async function (obj) {
     try {
          const { Id } = obj;
          const result = await getPool().request()
               .input('serialNumber', Id)
               .execute(`pro_UpdateQuotation`);
          return result;
     }
     catch {
          throw notifictions.find(n => n.status == 400)
     }
};

const updateSuppliersBranches = async function (obj) {
     try {

          const { name, supplierCode, id } = obj;
          const result = await getPool().request()
               .input('name', name)
               .input('id', id)
               .input('supplierCode', supplierCode)
               .execute(`pro_UpdateSuppliersBranches`);
          return result;
     }
     catch {
          throw notifictions.find(n => n.status == 400)
     }
};

const countRows = async function (obj) {
     try {
          const { tableName, condition } = obj;
          // const result = await getPool().request()
          //      .input('tableName', tableName)
          //      .input('condition', condition)
          //      .execute(`pro_CountRows`);

          const result = await getPool().request().query(`use ${SQL_DBNAME} SELECT COUNT(*) as countRows FROM ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} WHERE ${condition}`)
          // console.log({ count: result })
          return result;
     }
     catch (error) {
          throw error
     }
}

// function setValues(obj) {
//      let values = "";
//      for (let key in obj) {
//           values += `${key} = `;
//           if (typeof (obj[key]) === 'string') {
//                values += `N'${obj[key]}'`;
//           }
//           else {
//                if (typeof (obj[key]) === 'boolean')
//                     values += `'${obj[key]}'`;
//                else
//                     values += obj[key];
//           };
//           values += ' , ';
//      };
//      values = values.substring(0, values.length - 2);
//      return values;
// };


module.exports = {
     create,
     read,
     readAll,
     update,
     updateOne,
     updateQuotation,
     updateSuppliersBranches,
     countRows,
     join,
     createNewTable,
     insertColumn
}

