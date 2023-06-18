const { create } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

const {getSqlTableColumnsType, parseSQLType} = require('../modules/config')

async function createSql(obj) {
  
    let tabledata = getSqlTableColumnsType(obj.tableName)
    let arr = parseSQLType(obj.values, tabledata)
    
    console.log({obj})
    const result = await create({tableName:obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values:arr.join()});
    // console.log("result: "+result);
    
    return result;
};

async function createMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.insertOne(obj.data);
    return response;
};

module.exports = { createSql, createMng };
