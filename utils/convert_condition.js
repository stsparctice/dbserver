require('dotenv');
const { getTabeColumnName } = require('../modules/config/config');
const { parseSQLTypeForColumn, getAlias } = require('../modules/public')
const { parseColumnName, parseDBname } = require('./parse_name')
const operators = {
    AND: "AND",
    OR: "OR",
    BETWEEN: "BETWEEN",
    STARTWITH: "STARTWITH",
    ENDWITH: "ENDWITH",
    INCLUDES: "INCLUDES",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE",
    IN: "IN"
}
const convertToSqlCondition = (table, condition) => {
    const tableName = table.MTDTable.name.sqlName;
    const tablealias = getAlias(table.MTDTable.name.sqlName);
    const buildQuery = (condition, operator, sign = '=') => {
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
                    case operators.STARTWITH:
                        query = `${query} (${buildLike(condition[key], operators.STARTWITH)}) ${operator}`;
                        break;
                    case operators.ENDWITH:
                        query = `${query} (${buildLike(condition[key], operators.ENDWITH)}) ${operator}`;
                        break;
                    case operators.INCLUDES:
                        query = `${query} (${buildLike(condition[key]), operators.INCLUDES}) ${operator}`;
                        break;
                    case operators.IN:
                        query = `${query} (${buildIn(condition[key])}) ${operator}`;
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
    const buildOrAndGteLte = (array, operator, sign = '=') => {
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
    const buildLike = (like, operator) => {
        const key = Object.keys(like[0]);
        let val = {};
        val[key] = '';
        let column = Object.keys(parseColumnName(val, tableName))[0];
        let regex = ``;
        switch (operator) {
            case operators.STARTWITH:
                regex = `${like[0][key]}%`;
                break;
            case operators.ENDWITH:
                regex = `%${like[0][key]}`;
                break;
            case operators.INCLUDES:
                regex = `%${like[0][key]}%`;
                break;
            default:
                break;
        }
        const query = `${tablealias}.${column} LIKE '${regex}' `;
        return query;
    }
    const buildIn = (inArray) => {
        const key = Object.keys(inArray[0])[0];
        let val = {};
        val[key] = '';
        let column = Object.keys(parseColumnName(val, tableName))[0];
        const values = inArray.map((v) => { return `${parseSQLTypeForColumn({ name: key, value: v[key] }, tableName)}` })
        const query=`${tablealias}.${column} IN (${values.join(',')})`
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
    let s = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= '0' && str[i] <= '9')
            return s;
        s += str[i]
    }
    return s;
}
// const convertQueryToObject = (query) => {
//     // דוגמאות לשימוש בcondition 
//     //  {"condition":{"LIKE":[{"OrdererName":"*37"},{"OrdererName":"י"},{"OrdererName":"*37"}]}}
//     // {condition:{"AND":[{racheli:1},{michali:2},OR:[{sarit:5},{bilha:25},{BETWEEN:{michal:5,michal:25}}]],"LIKE":[{miri:('%').charCodeAt()},{miri:"א"}]}}
//     // and the simple condition doesnt work - condition:{"miri": "x"}
//     let obj = {}
//     // let pointer = [];
//     let i = 0;
//     const convert =  (key, value) => {
//         if (key.includes('start')) {
//             pointer[i][value] = []
//             if (i == pointer.length - 1)
//                 pointer.push(pointer[i][value])
//             else
//                 pointer[i + 1] = pointer[i][value]
//             i++;
//             return;
//         }
//         if (key.includes('end')) {
//             i--;
//             return;
//         }
//         else {
//             let object = {}
//             object[removeIndexes(key)] = value
//             pointer[i].push(object)
//             return;
//         }
//     }
//     for (const key in query) {
//         convert(key, query[key]);
//     }

//     // let condition = pointer.reduce((obj, item)=>({...obj, ...item}), {})
//     return obj

// }
const buildQuertObject = (arr, start, obj) => {
    console.log({ obj })
    for (let i = start; i < arr.length; i++) {
        for (const key in arr[i]) {
            console.log({ key })
            switch (key) {
                case 'start':
                    obj = {}
                    obj[arr[i][key]] = buildQuertObject(arr, i + 1, [])
                    console.log({ obj })
                    return obj
                case 'end':
                    return obj;
                default:
                    let newobj = {}
                    newobj[removeIndexes(key)] = arr[i][key]
                    obj = [...obj, newobj]
                    break;
            }
        }
    }
    return obj

}

const convertQueryToObject = (query) => {
    const queryArray = Object.entries(query).reduce((arr, entry) => arr = [...arr, Object.fromEntries([entry])], [])
    console.log(queryArray)
    let queryMap = buildQuertObject(queryArray, 0, [])
    console.log({ queryMap })
    if (queryMap.length > 0) {
        queryMap = queryMap.reduce((reduceObj, q) => {
            let key = Object.keys(q)
            let obj = {}
            obj[key] = q[key]
            return { ...reduceObj, ...obj }
        }, {})
    }
    console.log(queryMap)
    return queryMap
}






module.exports = { convertToMongoFilter, convertToSqlCondition, convertQueryToObject }
