const { update,updateOne, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
const {parseSQLTypeForColumn, getSqlTableColumnsType} = require('./config/config')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function updateSql(obj) {
    try {
        console.log({obj})
        let tabledata = getSqlTableColumnsType(obj.tableName)
       
        if(obj.condition){
            const entries = Object.entries(obj.condition)
            const conditionList = entries.map(c=>

                `${c[0]} =  ${parseSQLTypeForColumn({name:c[0], value:c[1]}, tabledata)}`
            )
            obj.condition = conditionList.join(' AND ')
        }
        else{
            obj.condition = "1 = 1"
        }
        console.log({obj})
        const result = await update(obj);
        return result;
    }
    catch (error){
        throw error
    }
};
async function updateOneSql(obj) {
    try{

        const result = await updateOne(obj);
        return result;
    }
    catch(error){
        throw error
    }
};
async function updateMng(obj) {
    try {
        console.log({obj})
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.updateOne(obj);
        return response;
    }
    catch (error){
        throw error
    }
};

async function updateQuotationSql(obj) {
    try {
        const result = await updateQuotation(obj);
        return result;
    }
    catch {
        throw new Error('Update faild.')
    }
};

async function updateSuppliersBranchesSql(obj) {
    try {
        const result = await updateSuppliersBranches(obj);
        return result;
    }
    catch {
        throw new Error('Update faild.')
    }
};

async function dropCollectionMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.dropCollection(obj);
        return response;
    }
    catch {
        throw new Error('Drop faild.')
    }
};

async function dropDocumentMng(obj) {
    const {data,collection}=obj;
    mongoCollection.setCollection(collection);
    const response = await mongoCollection.dropOneDocument(data);
    console.log({response})
    return response;
};


module.exports = { updateSql,updateOneSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng ,dropCollectionMng, dropDocumentMng};
