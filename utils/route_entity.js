const { getDBTypeAndName } = require('../modules/config/get-config')

const { convertToMongoFilter } = require('../services/mongoDB/mongoDB-helpers')
const { notifications } = require('../config/serverNotifictionsConfig.json')
const { DBType } = require('./types')

const routeEntityByItsType = async (data, sql, mongo, transaction) => {
    try {
        let dbObject = getDBTypeAndName(data.entityName)
        let result;
        if (dbObject.length > 1) {
            
            // data.sqlEntityName = dbObject.find(({type})=>type===DBType.SQL)
            result =await transaction(data)
        }
        else {
            let { type } = dbObject[0]

            if (type === DBType.SQL) {
                data.tableName = dbObject[0].entityName
                if (sql === undefined) {
                    error = notifications.find(n => n.status === 520)
                    error.description = 'missing required function for sql operation'
                    throw error
                }
                result = await sql(data);
            }
            if (type === DBType.MONGO) {
                if (data.condition) {
                    data.condition = convertToMongoFilter(data.condition);
                }
                data.collection = dbObject[0].entityName
                if (mongo === undefined) {
                    error = notifications.find(n => n.status === 520)
                    error.description = 'missing required function for mongo operation'
                    throw error
                }
                result = await mongo(data);
            }
        }
        // console.log({result})
        return result;
    }
    catch (error) {
        throw error;
    }
}

module.exports = { routeEntityByItsType };