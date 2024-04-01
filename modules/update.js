const { update, sqlTransaction } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { getPrimaryKeyField, parseSqlObjectToEntity, getConnectionBetweenEntities } = require('./config/config-sql');
const notifications = require('../config/serverNotifictionsConfig.json');
const { removeKeysFromObject, isEmpyObject } = require('../utils/code');
const { updateQuery } = require('../services/sql/sql-queries');
const { parseColumnName } = require('./config/get-config');

async function updateSql(obj) {
    try {
        const result = await update(obj);
        return result;
    }
    catch (error) {
        throw error
    }
};

//TODO: build disable connected entities more dynamic
async function updateOneSql(obj) {
    try {
        const primarykey = getPrimaryKeyField(obj.entityName);
        if (obj.condition === undefined || isEmpyObject(obj.condition)) {
            if (Object.keys(obj.sqlValues).includes(primarykey)) {
                obj.condition[primarykey] = obj.sqlValues[primarykey]
            }
        }
        else {
            const { sqlValues } = parseColumnName(obj.condition, obj.tableName)
            console.log({ sqlValues })
            obj.condition = sqlValues
        }

        obj.sqlValues = removeKeysFromObject(obj.sqlValues, [primarykey])
        const connectedEntities = getConnectionBetweenEntities(obj.tableName);
        let updateEntites = connectedEntities.filter(({ columns }) => columns.find(({ update }) => update))
        updateEntites = updateEntites.filter(({ columns }) => columns.find(col => Object.keys(obj.sqlValues).includes(col.update.parentColumn) && obj.sqlValues[col.update.parentColumn] == col.update.value))
            .map(({ tableName, columns }) => ({ tableName, columns: columns.filter(col => Object.keys(obj.sqlValues).includes(col.update.parentColumn) && obj.sqlValues[col.update.parentColumn] == col.update.value) }))
        let updateQueries = []
        if (updateEntites.length > 0) {
            updateQueries = updateEntites.map(({ tableName, columns }) => {
                let obj1 = { tableName }

                const queries = columns.map((col) => {
                    obj1.condition = {}
                    obj1.condition[col.sqlName] = obj.condition[primarykey]
                    switch (col.update.result) {
                        case 'disableEntity':
                            obj1.sqlValues = { Disabled: 1, DisabledDate: new Date().toISOString(), DisableUser: 'develop' }
                            let query = updateQuery(obj1)
                            return query
                        default: break;
                    }

                });
                return queries
            })

            console.log({ updateQueries })
        }

        let rowsAffected=0
        if(updateQueries.length>0){
            updateQueries = updateQueries.reduce((arr, q)=>[...arr, ...q], [])
             updateQueries = [...updateQueries,updateQuery(obj)]

             rowsAffected = (await sqlTransaction(updateQueries)).rowsAffected;
        }
        else{
            rowsAffected = await update(obj);
        }
        const condition = parseSqlObjectToEntity(obj.condition, obj.entityName)
        const result = { count: rowsAffected, condition };
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
