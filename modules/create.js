const { create, createNewTable, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

const { getSqlTableColumnsType, parseSQLType } = require('../modules/config/config')

async function createSql(obj) {

    let tabledata = getSqlTableColumnsType(obj.tableName)
    let arr = parseSQLType(obj.values, tabledata)

    const result = await create({ tableName: obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values: arr.join() });

    return result;
};

// {
//     "MTDTable": {
//         "name": {
//             "name": "unitOfMeasure",
//             "sqlName": "tbl_unitOfMeasure"
//         },
//         "description": "a normalization table of unitsOfMeasure"
//     },
//     "columns": [
//         {
//             "name": "id",
//             "type": "INT IDENTITY PRIMARY KEY NOT NULL"
//         },
//         {
//             "name": "measure",
//             "type": "NVARCHAR(20) NOT NULL "
//         }
//     ]
// },

async function creatNewColumn(obj) {
    console.log("creatNewColumn module");
    const result = await insertColumn(obj)
    return result
}

async function creatSqlTable(obj) {
    console.log("creatSqlTable module");
    const result = await createNewTable(obj)
    return result
}




async function createMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.insertOne(obj.data);
    return response;
};

module.exports = { createSql, createMng, creatSqlTable, creatNewColumn };
