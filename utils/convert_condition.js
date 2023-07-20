require('dotenv');
const { getTabeColumnName } = require('../modules/config/config');
const { parseSQLTypeForColumn, getAlias } = require('../modules/public')
const { parseColumnName, parseDBname } = require('./parse_name')
const operators = {
    AND: "AND",
    OR: "OR",
    BETWEEN: "BETWEEN",
    LIKE: "LIKE",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE"
}
const convertToSqlCondition = (table, condition) => {
    const tableName = table.MTDTable.name.sqlName;
    const tablealias = getAlias(table.MTDTable.name.sqlName);
    const buildQuery = (condition, operator, sign) => {
        try {
            let query = ``
            for (let key in condition) {
                switch (key) {
                    case operators.AND:
                        query = `${query} (${buildOrAndGteLte(condition[key], key)}) ${operator}`;
                        break;
                    case operators.OR:
                        query = `${query} (${buildOrAndGteLte(condition[key], key)}) ${operator}`;
                        break
                    case operators.BETWEEN:
                        query = `${query} (${buildBetween(condition[key])}) ${operator}`;
                        break
                    case operators.LIKE:
                        query = `${query} (${buildLike(condition[key])}) ${operator}`;
                        break;
                    case operators.GT:
                        query = `${query} (${buildOrAndGteLte(condition[key], "", ">")}) ${operator}`;
                        break;
                    case operators.GTE:
                        query = `${query} (${buildOrAndGteLte(condition[key], "", ">=")}) ${operator}`;
                        break;
                    case operators.LTE:
                        query = `${query} (${buildOrAndGteLte(condition[key], "", "<=")}) ${operator}`;
                        break;
                    case operators.LT:
                        query = `${query} (${buildOrAndGteLte(condition[key], "", "<")}) ${operator}`;
                        break;
                    default:
                        let val = {}
                        val[key] = ''
                        let column = Object.keys(parseColumnName(val, tableName))
                        query = `${query} ${tablealias}.${column} ${sign} ${parseSQLTypeForColumn({ name: key, value: condition[key] }, tableName)} ${operator}`;
                        break;
                }
            }
            return query;
        }
        catch (error) {
            console.log(error);
        }


    }
    const buildOrAndGteLte = (array, operator, sign) => {
        let query = ``;
        for (let item of array) {
            if (array.indexOf(item) === array.length - 1) {
                query = `${query} ${buildQuery(item, "", sign)}`
            }
            else
                query = `${query} ${buildQuery(item, operator, sign)}`
        }
        return query;
    }
    const buildBetween = (between) => {
        const key = Object.keys(between[0])[0];
        let val = {}
        val[key] = ''
        let column = Object.keys(parseColumnName(val, tableName))
        const query = `${tablealias}.${column} BETWEEN ${between[0][key]} AND ${between[1][key]}`;
        return query;

    }
    const buildLike = (like) => {
        
        const key = Object.keys(like[0]);
        let val = {};
        val[key] = '';
        let str = like.reduce((str, item) => {
            if (item[key].startsWith('*')) {
                str = `${str}${String.fromCharCode(item[key].slice(1, item.length))}`
            }
            else {
                str = `${str}${item[key]}`
            }
            return str;
        }, "")
        let column = Object.keys(parseColumnName(val, tableName))[0];
        const query = `${tablealias}.${column} LIKE '${str}' `;
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

const removeIndexes = (str) => {
    console.log({ str })
    let s = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= '0' && str[i] <= '9')
            return s;
        s += str[i]
    }
    return s;
}
const convertQueryToObject = (query) => {
    // דוגמאות לשימוש בcondition 
    //  {"condition":{"LIKE":[{"OrdererName":"*37"},{"OrdererName":"י"},{"OrdererName":"*37"}]}}
    // {condition:{"AND":[{racheli:1},{michali:2},OR:[{sarit:5},{bilha:25},{BETWEEN:{michal:5,michal:25}}]],"LIKE":[{miri:('%').charCodeAt()},{miri:"א"}]}}
    let obj = {}
    let pointer = [obj];
    let i = 0;
    const convert = async (key, value) => {
        console.log({ key, value })
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
            pointer[i].push(object)
            return;
        }
    }
    for (const key in query) {

        convert(key, query[key]);
        // i++
    }

    // let condition = pointer.reduce((obj, item)=>({...obj, ...item}), {})
    return obj

}


module.exports = { convertToMongoFilter, convertToSqlCondition, convertQueryToObject }
