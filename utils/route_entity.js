const { convertToMongoFilter, convertToSqlQuery } = require('./convert_condition')
const { checkEntityType } = require('../modules/public')

const routeEntityByItsType = async (data, sqlCallback, mongoCallback) => {
    try {
        let { type } = checkEntityType(data.entityName);
        let result;
        if (type === 'SQL') {
            result = await sqlCallback(data);
        }
        if (type === 'mongoDB') {
            if (data.condition) {
                data.condition = convertToMongoFilter(data.condition);
            }
            result = await mongoCallback(data);
        }
        return result;
    }
    catch (error) {
        throw error;
    }
}

module.exports = { routeEntityByItsType };