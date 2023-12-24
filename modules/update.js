const { update } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { getPrimaryKeyField } = require('./config/config-sql');
const notifications = require('../config/serverNotifictionsConfig.json');
const { removeKeysFromObject, isEmpyObject } = require('../utils/code');

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
        
        if(Object.keys(obj.sqlValues).includes(primarykey)){

            if(obj.condition === undefined ||isEmpyObject(obj.condition)){
                obj.condition[primarykey] = obj.sqlValues[primarykey]
            }
            obj.sqlValues = removeKeysFromObject(obj.sqlValues, [primarykey])
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
        const mongoOperations = new MongoDBOperations(obj.collection)
        const response = await mongoOperations.updateOne(obj);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function updateMany(obj) {
    try {
        const mongoOperations = new MongoDBOperations(obj.collection)
        const response = await mongoOperations.updateMany(obj);
        return response;
    }
    catch (error) {
        throw error
    }
}

async function dropCollectionMng(obj) {
    try {
        const mongoOperations = new MongoDBOperations(obj.collection)
        const response = await mongoOperations.dropCollection(obj);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function dropDocumentMng({ collection, filter }) {
    try {

        const mongoOperations = new MongoDBOperations(obj.collection)
        const response = await mongoOperations.dropOneDocument(filter);
        return response;
    }
    catch (error) {
        throw error
    }
};


module.exports = { updateSql, updateOneSql, updateOne, updateMany, dropCollectionMng, dropDocumentMng };
