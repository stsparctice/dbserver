const { parseDBname } = require('./parse_name')
const { convertToMongoFilter } = require('../services/mongoDB/mongoDB-helpers')
const { DBType } = require('./types')

const routeEntityByItsType = async (data, sql, mongo) => {
    try {
        let dbObject = parseDBname(data.entityName)
        console.log(dbObject);
        let { type } = dbObject
        let result;
        if (type === DBType.SQL) {
            data.tableName = dbObject.entityName
            result = await sql(data);
        }
        if (type === DBType.MONGO) {
            if (data.condition) {
                data.condition = convertToMongoFilter(data.condition);
            }
            data.collection = dbObject.entityName
            result = await mongo(data);
        }
        return result;
    }
    catch (error) {
        throw error;
    }
}

module.exports = { routeEntityByItsType };