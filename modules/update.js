const { update } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { getPrimaryKeyField } = require('./config/config-sql');
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


module.exports = { updateSql, updateOneSql, updateOne, updateMany, dropCollectionMng, dropDocumentMng };
