const { update,updateOne, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function updateSql(obj) {
    try {
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
    const response = await mongoCollection.dropDocument(data);
    return response;
};


module.exports = { updateSql,updateOneSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng ,dropCollectionMng};
