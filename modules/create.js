const { create, createNewTable, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;


const { getSqlTableColumnsType, parseSQLType } = require('../modules/config')

async function createSql(obj) {

    let tabledata = getSqlTableColumnsType(obj.tableName)
    let arr = parseSQLType(obj.values, tabledata)

    console.log({ obj })
    const result = await create({ tableName: obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values: arr.join() });
    console.log({result})
    if (result.recordset[0])
        return result.recordset[0];
    else
        return false
};



async function insertManySql(obj) {
    let tabledata
    let arr
    let values = obj.values

    let result = []
    for (let o of values) {
        tabledata = getSqlTableColumnsType(obj.tableName)
        arr = parseSQLType(o, tabledata);
        let res = await create({ tableName: obj.tableName, columns: (Object.keys(o).join()).trim(), values: arr.join() });
        result = [...result, res.recordset[0]]
    }
    if (result)
        return result;
    else
        return false;

}


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
    const result = await insertColumn(obj)
}

async function creatSqlTable(obj) {
    const result = await createNewTable(obj)
    return result
}




async function createMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.insertOne(obj.data);
    return response;
};

module.exports = { createSql, insertManySql, createMng, creatSqlTable, creatNewColumn };
