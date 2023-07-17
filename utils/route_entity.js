const { convertToMongoFilter, convertToSqlQuery } = require('./convert_condition')
const { checkEntityType } = require('../modules/config/config')

const routeEntityByItsType = async (data, sqlCallback, mongoCallback) => {
    try {
        let { type } = checkEntityType(data.entityName);
        let result;
        if (type === 'SQL') {
            if (data.condition) {
                data.condition = convertToSqlQuery(data.condition);
            }
            console.log({data});
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