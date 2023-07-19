const { parseDBname } = require('./parse_name')
const { convertToMongoFilter } = require('./convert_condition')
const { DBType } = require('../modules/config/config')

const routeEntityByItsType = async (data, sql, mongo) => {
    try {
        console.log({ data })
        let dbObject = parseDBname(data.entityName)
        let { type } = dbObject
        let result;
        if (type === DBType.SQL) {
            data.tableName = dbObject.entityName
            result = await sql(data);
            console.log({ result })
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
        console.log(error)
        throw error;
    }
}

module.exports = { routeEntityByItsType };