
require('dotenv').config();

const { getPool } = require('./sql-connection');
const { SQL_DBNAME } = process.env;


const create = async function (obj) {
     const { tableName, columns, values } = obj;
     // console.log({ tableName, columns, values });
     // let object =await buildcolumns({columns,values})
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('columns', columns)
          .input('values', values)
          .execute(`pro_BasicCreate`);
     return result;
};


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

     try {
          console.log("try sql");
          const findTable = await getPool().request().query(`use ${SQL_DBNAME} 
          SELECT * FROM sys.tables WHERE name = '${obj.tableName}'`)
          if (findTable.recordset.length == 0) {
               return ({ message: 'the table is not exists', data: findTable })
          }
          const findColumn = await getPool().request().query(`use ${SQL_DBNAME} 
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${obj.tableName}' AND COLUMN_NAME='${obj.column.sqlName}'`)
          if (findColumn.recordset.length == 0) {
               _ = await getPool().request().query(`use ${SQL_DBNAME}  
          ALTER TABLE ${obj.tableName} ADD ${obj.column.sqlName} ${obj.column.type}`)
               return ({ message: "sucsses insert column", findColumn: findColumn, len: findColumn.recordset.length })
          }
          else {
               return ({ message: "the column was exists", data: findColumn })
          }
     } catch {
          console.log("error sql");
          throw new Error('ERROR! server faild')
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
          let str = ''
          obj.columns.forEach(element => {
               str += `${element.sqlName} ${element.type},`
          });
          const findTable = await getPool().request().query(`use ${SQL_DBNAME} 
          SELECT * FROM sys.tables WHERE name = '${obj.MTDTable.name.sqlName}'`)
          if (findTable.recordset.length > 0) {
               return ({ message: 'the table was exists', data: findTable.recordset })
          }
          else {
               _ = await getPool().request().query(`use ${SQL_DBNAME} CREATE TABLE [dbo].[${obj.MTDTable.name.sqlName}](${str})`)
               return ({ message: 'insert sucsses', data: findTable.recordset })
          }
     } catch {
          throw new Error('ERROR! server faild')
     }

}

const read = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     if (!Object.keys(obj).includes("n")) {
          obj["n"] = 100;
     }
     const { tableName, columns, condition, n } = obj;
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('columns', columns)
          .input('condition', condition)
          .input('n', n)
          .execute(`pro_BasicRead`);
     return result.recordset;
};

const readAll = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     const { tableName, condition } = obj;
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('condition', condition)
          .execute(`pro_ReadAll`);
     return result.recordset;
};

const update = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     const { tableName, values, condition } = obj;
     const value = setValues(values);
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('values', value)
          .input('condition', condition)
          .execute(`pro_BasicUpdate`);
     return result;
};

// 
const updateQuotation = async function (obj) {
     const { serialNumber } = obj;
     const result = await getPool().request()
          .input('serialNumber', serialNumber)
          .execute(`pro_UpdateQuotation`);
     return result;
};

const updateSuppliersBranches = async function (obj) {
     const { name, supplierCode } = obj;
     const result = await getPool().request()
          .input('name', name)
          .input('supplierCode', supplierCode)
          .execute(`pro_UpdateSuppliersBranches`);
     return result;
};

const countRows = async function (obj) {
     const { tableName, condition } = obj;
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('condition', condition)
          .execute(`pro_CountRows`);
     return result;
};

function setValues(obj) {
     let values = "";
     for (let key in obj) {
          values += `${key} = `;
          if (typeof (obj[key]) === 'string' || typeof (obj[key]) === 'boolean') {
               values += `'${obj[key]}'`;
          }
          else {
               values += obj[key];
          };
          values += ' , ';
     };
     values = values.substring(0, values.length - 2);
     return values;
};

async function buildcolumns(obj) {
     let values = "";
     let columns = "";
     for (let key = 0; key < obj['values'].length; key++) {
          if (typeof (obj['values'][key]) === 'string' && obj['values'][key] != 'NULL') {
               values += `'${obj['values'][key]}'`;
          }
          else {
               values += obj['values'][key];
          };
          values += ', ';
     };
     values = values.substring(0, values.length - 2);
     for (let key = 0; key < obj['columns'].length; key++) {
          columns += `${obj['columns'][key]},`;
     };
     columns = columns.substring(0, columns.length - 1);
     return { columns, values };
};

module.exports = {
     buildcolumns,
     create,
     read,
     readAll,
     update,
     updateQuotation,
     updateSuppliersBranches,
     countRows,
     createNewTable,
     insertColumn
};
