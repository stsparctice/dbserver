require('dotenv').config();

const { getPool } = require('./sql-connection');
const { SQL_DBNAME } = process.env;
const {getPrimaryKeyField} = require('../../modules/config/config')

const create = async function (obj) {
     const { tableName, columns, values } = obj;
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('columns', columns)
     //      .input('values', values)
     //      .execute(`pro_BasicCreate`);

     //      console.log({result})
     console.log({ tableName, columns, values })
     const primarykey = getPrimaryKeyField(tableName)
     const result = await getPool().request().query(`use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}) SELECT @@IDENTITY ${primarykey}`)
      return result.recordset;

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
     console.log(obj);
     _ = await getPool().request().query(`use ${SQL_DBNAME} IF NOT EXISTS
     (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${obj.tableName} AND COLUMN_NAME=${OBJ.columns.name}') 
     ALTER TABLE ${obj.tableName} ADD ${obj.column.name} ${obj.column.type}
     ELSE PRINT('NO')`)
     return 'success_column'
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
     console.log(obj);
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

const read = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj.condition = '1=1';
     };
     if (!Object.keys(obj).includes("n")) {
          obj.n = 100;
     }
     const { tableName, columns, condition, n } = obj;
     console.log({ tableName, columns, condition, n })
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('columns', columns)
     //      .input('condition', condition)
     //      .input('n', n)
     //      .execute(`pro_BasicRead`);
     const result = await getPool().request().query(`use ${SQL_DBNAME} select top ${n} ${columns} from ${tableName} where ${condition}`);
     return result.recordset;
};


const readAll = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     const { tableName, condition } = obj;
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('condition', condition)
     //      .execute(`pro_ReadAll`);
     const result = await getPool().request().query(`use ${SQL_DBNAME} select * from ${tableName} where ${condition}`)
     return result.recordset;
};

const join = async (query = "") => {
     const result = await getPool().request().query(query.trim());
     if (result.recordset) {
          return result.recordset;
     }
     return false;
};

const update = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     const { tableName, values, condition } = obj;
     const value = setValues(values);
     
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('values', value)
     //      .input('condition', condition)
     //      .execute(`pro_BasicUpdate`);

     const query = `use ${SQL_DBNAME} UPDATE ${tableName} SET ${value} WHERE ${condition}`
     console.log({query})
     const result = await getPool().request().query(`use ${SQL_DBNAME} UPDATE ${tableName} SET ${value} WHERE ${condition}`)
     return result;
};

// 
const updateQuotation = async function (obj) {
     const { Id } = obj;
     const result = await getPool().request()
          .input('serialNumber', Id)
          .execute(`pro_UpdateQuotation`);
     return result;
};

const updateSuppliersBranches = async function (obj) {
     const { name, supplierCode, id } = obj;
     const result = await getPool().request()
          .input('name', name)
          .input('id', id)
          .input('supplierCode', supplierCode)
          .execute(`pro_UpdateSuppliersBranches`);
     return result;
};

const countRows = async function (obj) {
     const { tableName, condition } = obj;
     // const result = await getPool().request()
     //      .input('tableName', tableName)
     //      .input('condition', condition)
     //      .execute(`pro_CountRows`);
     const result = await getPool().request().query(`use ${SQL_DBNAME} SELECT COUNT(*) FROM ${tableName} WHERE ${condition}`)
     return result;
};

function setValues(obj) {
     let values = "";
     for (let key in obj) {
          values += `${key} = `;
          if (typeof (obj[key]) === 'string') {
               values += `N'${obj[key]}'`;
          }
          else {
               if (typeof (obj[key]) === 'boolean')
                    values += `'${obj[key]}'`;
               else
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
               values += `N'${obj['values'][key]}'`;
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
     create,
     read,
     readAll,
     update,
     updateQuotation,
     updateSuppliersBranches,
     countRows,
     join,
     createNewTable,
     insertColumn
};
