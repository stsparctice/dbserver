const { getPool } = require('./sql-connection');

const create = async function (obj) {
     const { tableName, columns, values } = obj;
     let object =await buildcolumns({columns,values})
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('columns',object['columns'])
          .input('values', object['values'])
          .execute(`pro_BasicCreate`);
     return result;
};

const read = async function (obj) {
     if (!Object.keys(obj).includes("condition")) {
          obj["condition"] = '1=1';
     };
     const { tableName, columns, condition } = obj;
     const result = await getPool().request()
          .input('tableName', tableName)
          .input('columns', columns)
          .input('condition', condition)
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
     for (let key=0;key<obj['values'].length;key++) {
          if (typeof (obj['values'][key]) === 'string' && obj['values'][key] != 'NULL') {
               values += `'${obj['values'][key]}'`;
          }
          else {
               values += obj['values'][key];
          };
          values += ', ';
     };
     values = values.substring(0, values.length - 2);
     for (let key=0;key<obj['columns'].length;key++) {
          columns += `${obj['columns'][key]},`;
     };
     columns = columns.substring(0, columns.length - 1);
     return {columns,values};
};

module.exports = {
     create,
     read,
     readAll,
     update,
     updateQuotation,
     updateSuppliersBranches,
     countRows
};
