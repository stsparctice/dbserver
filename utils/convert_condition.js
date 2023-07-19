const { parseSQLTypeForColumn } = require('../modules/public')
require('dotenv');
const convertToSqlCondition = (tableName, condition) => {
    const buildQuery = (condition, operator) => {
        try {
            let query = ``
            for (let key in condition) {
                if (key === 'AND') {
                    query = `${query} (${buildOrAnd(condition[key], "AND")}) ${operator}`;
                }
                else {
                    if (key === 'OR') {
                        query = `${query} (${buildOrAnd(condition[key], "OR")}) ${operator}`;
                    }
                    else {
                        if (key === 'BETWEEN') {
                            query = `${query} (${buildBetween(condition[key])}) ${operator}`
                        }
                        else {
                            query = `${query} ${tableName}.${key} = ${parseSQLTypeForColumn({ name: key, value: condition[key] }, tableName)} ${operator}`;
                        }
                    }
                }
            }
            return query;
        }
        catch (error) {
            console.log(error);
        }


    }
    const buildOrAnd = (array, operator) => {
        let query = ``;
        for (let item of array) {
            if (array.indexOf(item) === array.length - 1) {
                query = `${query} ${buildQuery(item, "")}`
            }
            else
                query = `${query} ${buildQuery(item, operator)}`
        }
        return query;
    }
    const buildBetween = (between) => {
        const key = Object.keys(between)[0];
        const query = `${tableName}.${key} BETWEEN ${between[key][0]} AND ${between[key][1]}`;
        return query;

    }
    let result = buildQuery(condition, "AND");
    result = result.slice(0, result.length - 3);
    return result;
}
const convertToMongoFilter = (condition) => {
    let filter = {}
    for (let key in condition) {
        if (condition[key] instanceof Array) {
            filter[`$${key.toLowerCase()}`] = condition[key].map(o => convertToMongoFilter(o))
        }
        else {
            filter[key] = condition[key]
        }
    }
    return filter
}

module.exports = { convertToMongoFilter ,convertToSqlCondition}
