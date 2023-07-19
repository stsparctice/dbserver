const { convertToMongoFilter } = require('./convert_condition')
const { checkEntityType } = require('../modules/public')

const routeEntityByItsType = async (data, sql, mongo) => {
    try {
        let { type } = checkEntityType(data.entityName);
        let result;
        if (type === 'SQL') {
            result = await sql(data);
        }
        if (type === 'mongoDB') {
            if (data.condition) {
                data.condition = convertToMongoFilter(data.condition);
            }
            result = await mongo(data);
        }
        return result;
    }
    catch (error) {
        throw error;
    }
}

module.exports = { routeEntityByItsType };