const { update, updatOne, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
// const { parseSQLTypeForColumn, getSqlTableColumnsType } = require('./config/config')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { getPrimaryKeyField } = require('./public');
const mongoCollection = MongoDBOperations;
const notifications = require('../config/serverNotifictionsConfig.json')

async function updateSql(obj) {
    try {

        const result = await update(obj);
        return result;
    }
    catch (error) {
        throw error
    }
};
async function updateOneSql(obj) {
    try {
        const primarykey = getPrimaryKeyField(obj.entityName);
        console.log({primarykey});
        if (!obj.condition[primarykey]) {
            throw notifications.find(n => n.status === 400)
        }
        const result = await update(obj);
        return result;
    }
    catch (error) {
        throw error
    }
};
async function updateOne(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.updateOne(obj);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function updateMany(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.updateMany(obj);
        return response;
    }
    catch (error) {
        throw error
    }
}

async function updateQuotationSql(obj) {
    try {
        const result = await updateQuotation(obj);
        return result;
    }
    catch (error) {
        throw error
    }
};

async function updateSuppliersBranchesSql(obj) {
    try {
        const result = await updateSuppliersBranches(obj);
        return result;
    }
    catch (error) {
        throw error
    }
};

async function dropCollectionMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.dropCollection(obj);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function dropDocumentMng(obj) {
    try {

        const { data, collection } = obj;
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.dropOneDocument(data);
        return response;
    }
    catch (error) {
        throw error
    }
};


module.exports = { updateSql, updateOneSql, updateQuotationSql, updateSuppliersBranchesSql, updateOne, updateMany, dropCollectionMng, dropDocumentMng };
