const { create, createNewTable, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;


const { getSqlTableColumnsType, parseSQLType } = require('../modules/config/config')

async function createSql(obj) {
    try {
        let tabledata = getSqlTableColumnsType(obj.tableName)
        let arr = parseSQLType(obj.values, tabledata)

        console.log({ obj })
        const result = await create({ tableName: obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values: arr.join() });
        console.log({ result })
    }
    catch (error){
        throw error
    }
};


async function insertManySql(obj) {
    try {
        let tabledata
        let arr
        let values = obj.values

        let result = []
        for (let o of values) {
            tabledata = getSqlTableColumnsType(obj.tableName)
            arr = parseSQLType(o, tabledata);
            let res = await create({ tableName: obj.tableName, columns: (Object.keys(o).join()).trim(), values: arr.join() });
            result = [...result, res]
        }
        if (result)
            return result;
        else
            return false;
    }
    catch {
        throw new Error('Insert failed.')
    }
}
async function creatNewColumn(obj) {
    const result = await insertColumn(obj)
}

async function creatSqlTable(obj) {
    const result = await createNewTable(obj)
    return result
}

async function createMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.insertOne(obj.data);
        return response;
    }
    catch (error){
        throw error
    }
};

module.exports = { createSql, insertManySql, createMng, creatSqlTable, creatNewColumn };
