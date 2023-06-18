const { create, createNewTable, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

const { getSqlTableColumnsType, parseSQLType } = require('../modules/config/config')

async function createSql(obj) {
    let tabledata = getSqlTableColumnsType(obj.tableName)
    let arr = parseSQLType(obj.values, tabledata)
    
    console.log({obj})
    const result = await create({tableName:obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values:arr.join()});
    // console.log("result: "+result);
    
    return result;
};


async function insertManySql(obj) {
    let tabledata
    let arr
    let values = obj.values

    let result
    _ = values.forEach(async o => (
        tabledata = getSqlTableColumnsType(obj.tableName),
        arr = parseSQLType(o, tabledata),
        await create({ tableName: obj.tableName, columns: (Object.keys(o).join()).trim(), values: arr.join() })))
    return result

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

module.exports = { createSql,insertManySql, createMng, creatSqlTable, creatNewColumn };
