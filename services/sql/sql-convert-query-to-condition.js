const { queryOperators } = require('../../utils/types')
const { parseColumnName } = require('../../utils/parse_name')
const { parseSQLTypeForColumn, getAlias } = require('../../modules/config/config-sql')

function convertQueryToSQLCondition(table, condition) {
    const tableName = table.MTDTable.name.sqlName;
    const tablealias = getAlias(table.MTDTable.name.sqlName);
    let result = buildQuery(condition, queryOperators.AND);
    result = result.slice(0, result.length - 3);
    return result;
}

function buildQuery(condition, operator, sign = '=') {
    try {
        let query = ``
        for (let key in condition) {
            switch (key) {
                case queryOperators.AND:
                    query = `${query} (${buildOrAndGteLte(condition[key], key)}) ${operator}`;
                    break;
                case queryOperators.OR:
                    query = `${query} (${buildOrAndGteLte(condition[key], key)}) ${operator}`;
                    break
                case queryOperators.BETWEEN:
                    query = `${query} (${buildBetween(condition[key])}) ${operator}`;
                    break
                case queryOperators.STARTWITH:
                    query = `${query} (${buildLike(condition[key], operators.STARTWITH)}) ${operator}`;
                    break;
                case queryOperators.ENDWITH:
                    query = `${query} (${buildLike(condition[key], operators.ENDWITH)}) ${operator}`;
                    break;
                case queryOperators.INCLUDES:
                    query = `${query} ${buildLike(condition[key], operators.INCLUDES)} ${operator}`;
                    break;
                case queryOperators.IN:
                    query = `${query} (${buildIn(condition[key])}) ${operator}`;
                    break;
                case queryOperators.GT:
                    query = `${query} (${buildOrAndGteLte(condition[key], "", ">")}) ${operator}`;
                    break;
                case queryOperators.GTE:
                    query = `${query} (${buildOrAndGteLte(condition[key], "", ">=")}) ${operator}`;
                    break;
                case queryOperators.LTE:
                    query = `${query} (${buildOrAndGteLte(condition[key], "", "<=")}) ${operator}`;
                    break;
                case queryOperators.LT:
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

function buildOrAndGteLte(array, operator, sign = '=') {
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

function buildBetween(between) {
    const key = Object.keys(between[0])[0];
    let val = {}
    val[key] = ''
    let column = Object.keys(parseColumnName(val, tableName))
    const query = `${tablealias}.${column} BETWEEN ${between[0][key]} AND ${between[1][key]}`;
    return query;

}

function buildLike(like, operator) {
    console.log({ like, operator })
    const key = Object.keys(like[0]);
    let val = {};
    val[key] = '';
    let column = Object.keys(parseColumnName(val, tableName))[0];
    console.log({ column })
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

function buildIn(inArray) {
    const key = Object.keys(inArray[0])[0];
    let val = {};
    val[key] = '';
    let column = Object.keys(parseColumnName(val, tableName))[0];
    const values = inArray.map((v) => { return `${parseSQLTypeForColumn({ name: key, value: v[key] }, tableName)}` })
    const query = `${tablealias}.${column} IN (${values.join(',')})`
    return query;
}





module.export = { convertQueryToSQLCondition, buildBetween, buildIn, buildLike, buildOrAndGteLte, }