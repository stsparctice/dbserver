const { getPool } = require('./sql-connection');

const create = async function (obj) {
     let values = await buildcolumns(obj['values']);
     const result = await getPool().request()
          .input('tableName', obj.tableName)
          .input('values', values)
          .execute(`pro_BasicCreate`);
     return result;
};

const read = async function (obj) {
     let result = await getPool().request()
          .input('tableName', obj.tableName)
          .input('columns', obj.columns)
          .input('condition', obj.condition)
          .execute(`pro_BasicRead`);
     return result;
};

const update = async function (obj) {
     let values = setValues(obj['values']);
     let result = await getPool().request()
          .input('tableName', obj.tableName)
          .input('values', values)
          .input('condition', obj.condition)
          .execute(`pro_BasicUpdate`);
     return result;
};

function setValues(obj) {
     let values = "";
     for (let key in obj) {
          values += `${key} = `;
          if (typeof (obj[key]) === 'string' || typeof (obj[key]) === 'boolean')
               values += `'${obj[key]}'`;
          else
               values += obj[key];
          values += ' , ';
     };
     values = values.substring(0, values.length - 2);
     return values;
};

async function buildcolumns(obj) {
     let values = "";
     for (let key in obj) {
          if (typeof (obj[key]) === 'string' && obj[key] != 'NULL') {
               values += `'${obj[key]}'`;
          }
          else {
               values += obj[key];
          }
          values += ', ';
     };
     values = values.substring(0, values.length - 2);
     return values;
};

module.exports = {
     create,
     read,
     update
};

