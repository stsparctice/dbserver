require('dotenv');
const { SQL_DBNAME } = process.env;
const { DBType } = require('../../utils/types')
const DBconfig = require('../../config/DBconfig.json');
const notifictaions = require('../../config/serverNotifictionsConfig.json');
const { getTableFromConfig, parseSqlObjectToEntity } = require('./config-sql');
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
    const sql = getTableFromConfig(sqlEntity)
    const sqlReferences = sql.columns.filter(({ reference }) => reference && reference.database === DBType.MONGO && reference.collection === mongoEntity)
    // if (sqlReferences.length > 0)
    return { sqlReferences }

}

const connectBetweenMongoAndSqlObjects = ({ mongoObjects, sqlObjects, sqlReferences, entityName }) => {
    const referenceMongoFields = sqlReferences.map(({ sqlName,name, reference }) => ({ sqlName,name, mongo: reference.field }))
    const fullObjects = sqlObjects.map(item => {
        const itemKeyValues = Object.entries(item).map(([key, value]) => ({ key, value }))
        const joinFields = itemKeyValues.filter(({ key }) => referenceMongoFields.find(({ sqlName, name }) => sqlName === key||name===key))
        const search = joinFields.map(({ key, value }) => ({ key: referenceMongoFields.find(({ sqlName, name }) => sqlName === key|| name===key).mongo, value }))
        const mongoObject = mongoObjects.find(mongo => {
            for (let query of search) {
                console.log({query})
                if (mongo[query.key] !== query.value)
                    return false
            }
            return true
        })
        if (mongoObject) {
            const mongoFields = removeKeysFromObject(mongoObject, referenceMongoFields.map(({ mongo }) => mongo))
            const fullObject = { ...parseSqlObjectToEntity(item, entityName), ...mongoFields }
            return fullObject
        }
        return null

    })
    return fullObjects.filter(obj => obj !== null)
}


module.exports = {
    getDBTypeAndName,
    getConnectionBetweenMongoAndSqlEntities,
    connectBetweenMongoAndSqlObjects
};
