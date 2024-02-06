require('dotenv');
const { SQL_DBNAME } = process.env;
const { DBType } = require('../../utils/types')
const DBconfig = require('../../config/DBconfig.json');
const notifictaions = require('../../config/serverNotifictionsConfig.json');
const { getTableFromConfig, parseSqlObjectToEntity, getTableColumns, existsEntityInSql } = require('./config-sql');
const { removeKeysFromObject } = require('../../utils/code');

const getDBTypeAndName = (entityName, config = DBconfig) => {
    const sql = config.find(db => db.database === DBType.SQL);
    const tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
    const table = tables.find(table => table.MTDTable.name.name == entityName || table.MTDTable.name.sqlName == entityName);
    const mongo = config.find(db => db.database === DBType.MONGO);
    const collection = mongo.collections.find(({ name }) => name === entityName);
    const result = []
    if (table) {
        result.push({ type: DBType.SQL, entityName: table.MTDTable.name.sqlName })
    }
    if (collection) {
        result.push({ type: DBType.MONGO, entityName: collection.mongoName })
    }
    if (result.length > 0) {
        return result
    }
    else {
        let error = notifictaions.find(n => n.status === 516)
        error.description = `The entity name ${entityName} does not exist`
        throw error;
    }
}

const getConnectionBetweenMongoAndSqlEntities = ({ mongoEntity, sqlEntity }) => {
    console.log({ sqlEntity });
    const sql = getTableFromConfig(sqlEntity)
    const sqlReferences = sql.columns.filter(({ reference }) => reference && reference.database === DBType.MONGO && reference.collection === mongoEntity)
    // if (sqlReferences.length > 0)
    return { sqlReferences }

}

const connectBetweenMongoAndSqlObjects = ({ mongoObjects, sqlObjects, sqlReferences, entityName }) => {
    const referenceMongoFields = sqlReferences.map(({ sqlName, name, reference }) => ({ sqlName, name, mongo: reference.field }))
    const fullObjects = sqlObjects.map(item => {
        const itemKeyValues = Object.entries(item).map(([key, value]) => ({ key, value }))
        const joinFields = itemKeyValues.filter(({ key }) => referenceMongoFields.find(({ sqlName, name }) => sqlName === key || name === key))
        const search = joinFields.map(({ key, value }) => ({ key: referenceMongoFields.find(({ sqlName, name }) => sqlName === key || name === key).mongo, value }))
        const mongoObject = mongoObjects.find(mongo => {
            for (let query of search) {
                if (mongo[query.key] !== query.value)
                    return false
            }
            return true
        })
        if (mongoObject) {
            const mongoFields = removeKeysFromObject(mongoObject, referenceMongoFields.map(({ mongo }) => mongo))
            console.log({ mongoFields });
            const fullObject = { ...parseSqlObjectToEntity(item, entityName), ...mongoFields }
            return fullObject
        }
        return null

    })
    return fullObjects.filter(obj => obj !== null)
}

function parseColumnName(values, table) {
    console.log({ values })
    try {
        let columns = getTableColumns(table)
        let sqlValues = undefined;
        let noSqlValues = undefined;
        let connectedEntities = undefined;
        if (Array.isArray(values)) {
            sqlValues = []
            noSqlValues = []
            connectedEntities = []
            for (let name of values) {
                if (typeof name === 'object') {
                    let answer = parseColumnName(name, table)
                    connectedEntities = [...connectedEntities, answer]
                }
                else {
                    let column = columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() ||
                        column.sqlName.trim().toLowerCase() == name.trim().toLowerCase());
                    if (column) {
                        sqlValues = [...sqlValues, column.sqlName];
                    }
                    else {
                        noSqlValues = [...noSqlValues, name];
                    }
                }
            }
        }
        else {
            sqlValues = {};
            noSqlValues = {};
            connectedEntities = {}
            for (let name in values) {
                if (values[name] !== null) {
                    let column = columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() ||
                        column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
                    if (column) {
                        sqlValues[column.sqlName] = values[name]
                    }
                    else {
                        if (Array.isArray(values[name])) {
                            const isEntity = existsEntityInSql(name)
                            if(isEntity){
                                connectedEntities[name] = values[name].map(item => parseColumnName(item, name))
                            }
                            else{
                                noSqlValues[name] = values[name];
                            }
                        }
                        else {
                            noSqlValues[name] = values[name];
                        }
                    }
                                  }
            }
        }

        let response = {
            sqlValues: checkEmptyArrayOrObject(sqlValues),
            noSqlValues: checkEmptyArrayOrObject(noSqlValues),
            connectedEntities: checkEmptyArrayOrObject(connectedEntities)
        }

        response = removeKeysFromObject(response, Object.keys(response).filter(key => response[key] === undefined))

        return response

    }
    catch (error) {
        throw error
    }

}

function checkEmptyArrayOrObject(item) {
    if (Array.isArray(item) && item.length > 0)
        return item
    if (!Array.isArray(item) && Object.keys(item).length > 0)
        return item
    return undefined
}


module.exports = {
    getDBTypeAndName,
    getConnectionBetweenMongoAndSqlEntities,
    connectBetweenMongoAndSqlObjects,
    parseColumnName
};
