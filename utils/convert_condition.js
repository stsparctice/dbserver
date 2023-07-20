require('dotenv');
const { getTabeColumnName } = require('../modules/config/config');
const { parseSQLTypeForColumn, getAlias } = require('../modules/public')
const { parseColumnName, parseDBname } = require('./parse_name')

const convertToSqlCondition = (table, condition) => {
    const tableName = table.MTDTable.name.sqlName;
    const tablealias = getAlias(table.MTDTable.name.sqlName);
    const buildQuery = (condition, operator) => {
        try {
            let query = ``
            for (let key in condition) {
                switch (key) {
                    case 'AND':
                        query = `${query} (${buildOrAnd(condition[key], "AND")}) ${operator}`;
                        break;
                    case 'OR':
                        query = `${query} (${buildOrAnd(condition[key], "OR")}) ${operator}`;
                        break
                    case 'BETWEEN':
                        query = `${query} (${buildBetween(condition[key])}) ${operator}`
                        break
                    case 'LIKE':
                        query = `${query} (${buildLike(condition[key])}) ${operator}`
                        break
                    default:
                        let val = {}
                        val[key] = ''
                        let column =  Object.keys(parseColumnName(val, tableName))
                        query = `${query} ${tablealias}.${column} = ${parseSQLTypeForColumn({ name: key, value: condition[key] }, tableName)} ${operator}`;
                        break;
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
            console.log({between});
            const key = Object.keys(between[0])[0];
            let val = {}
            val[key] = ''
            let column = Object.keys(parseColumnName(val, tableName))
            const query = `${tablealias}.${column} BETWEEN ${between[0][key][0]} AND ${between[0][key][1]}`;
            return query;
            
        }
        const buildLike = (like) => {
            like = like[0];
            const key = Object.keys(like)[0];
            let val = {}
            val[key] = ''
            let column = Object.keys(parseColumnName(val, tableName))[0]
            const query = `${tablealias}.${column} LIKE '%${like[key]}%'`;
            return query;
        }
        console.log({condition});
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

const removeIndexes = (str) => {
    console.log({str})
    let s = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= '0' && str[i] <= '9')
            return s;
        s += str[i]
    }
    return s;
}
const convertQueryToObject = (query) => {
        let pointer = [];
        let i = 0;
        const convert = async (key, value) => {
            console.log({key, value})
            if (key.includes('start')) {
                pointer[i][value] = []
                if (i == pointer.length - 1)
                    pointer.push(pointer[i][value])
                else
                    pointer[i + 1] = pointer[i][value]
                i++;
                return;
            }
            if (key.includes('end')) {
                i--;
                return;
            }
            else {
                let object = {}
                object[removeIndexes(key)] = value
                pointer[i]=object
                return;
            }
        }
        for (const key in query) {
            
            convert(key, query[key]);
            i++
        }

        let condition = pointer.reduce((obj, item)=>({...obj, ...item}), {})
        return condition
      
}

module.exports = { convertToMongoFilter, convertToSqlCondition, convertQueryToObject }
