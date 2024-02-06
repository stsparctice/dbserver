const { queryOperators } = require('../../utils/types')
const { getTableAlias, parseColumnSQLType, getSqlTableColumnsType, getTableColumnsSQLName, getTableFromConfig } = require('../../modules/config/config-sql')
const {parseColumnName} = require('../../modules/config/get-config')
const { removeKeysFromObject } = require('../../utils/code')


class ConvertQueryToSQLCondition {
    constructor() { }
    setTable(value) {
        this.table = value
        if (typeof (value) === 'string')
            this.table = getTableFromConfig(value)
        this.tableName = this.table.MTDTable.name.sqlName;
        this.tableAlias = getTableAlias(this.tableName)
    }

    convertCondition(condition) {
        try {
            let result = this.buildQuery(condition, queryOperators.AND);
            result = result.slice(0, result.length - 3);
            return result;
        }
        catch (error) {
            throw error
        }
    }

    buildQuery(condition, operator, sign = '=') {
        try {
            let query = ``
            for (let key in condition) {
                switch (key) {
                    case queryOperators.AND:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], key)}) ${operator}`;
                        break;
                    case queryOperators.OR:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], key)}) ${operator}`;
                        break
                    case queryOperators.BETWEEN:
                        query = `${query} (${this.buildBetween(condition[key])}) ${operator}`;
                        break
                    case queryOperators.STARTWITH:
                        query = `${query} (${this.buildLike(condition[key], queryOperators.STARTWITH)}) ${operator}`;
                        break;
                    case queryOperators.ENDWITH:
                        query = `${query} (${this.buildLike(condition[key], queryOperators.ENDWITH)}) ${operator}`;
                        break;
                    case queryOperators.INCLUDES:
                        const partialquery = this.buildLike(condition[key], key)
                        console.log({partialquery});
                        query = `${query} ${this.buildLike(condition[key], key)} ${operator}`;
                        break;
                    case queryOperators.IN:
                        query = `${query} (${this.buildIn(condition[key])}) ${operator}`;
                        break;
                    case queryOperators.GT:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], "", ">")}) ${operator}`;
                        break;
                    case queryOperators.GTE:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], "", ">=")}) ${operator}`;
                        break;
                    case queryOperators.LTE:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], "", "<=")}) ${operator}`;
                        break;
                    case queryOperators.LT:
                        query = `${query} (${this.buildOrAndGteLte(condition[key], "", "<")}) ${operator}`;
                        break;
                    default:
                        let val = {}
                        val[key] = condition[key]
                        let column = Object.keys(parseColumnName(val, this.tableName).sqlValues)
                        if (key !== column) {
                           val = removeKeysFromObject(val, [key])
                           val[column] = condition[key]
                        }
                        let tabledata = getSqlTableColumnsType(this.tableName)
                        query = `${query} ${this.tableAlias}.${column} ${sign} ${parseColumnSQLType(val, tabledata)} ${operator}`;
                        console.log({ query })
                        break;
                }
            }
            return query;
        }
        catch (error) {
            console.log(error);
            throw error
        }


    }

    buildOrAndGteLte(array, operator, sign = '=') {
        let query = ``;
        for (let item of array) {
            if (array.indexOf(item) === array.length - 1) {
                query = `${query} ${this.buildQuery(item, "", sign)}`
            }
            else
                query = `${query} ${this.buildQuery(item, operator, sign)}`
        }
        return query;
    }

    buildBetween(between) {
        const key = Object.keys(between[0])[0];
        let val = {}
        val[key] = ''
        let column = Object.keys(parseColumnName(val, this.tableName).sqlValues)
        const query = `${this.tablealias}.${column} BETWEEN ${between[0][key]} AND ${between[1][key]}`;
        return query;

    }
    buildLike(like, operator) {
        console.log({like})
        if(Array.isArray(like)){
            like = like[0]
        }
        const key = Object.keys(like);
        let val = {};
        val[key] = '';
        let column = Object.keys(parseColumnName(val, this.tableName).sqlValues)[0];
        let regex = ``;
        switch (operator) {
            case queryOperators.STARTWITH:
                regex = `${like[key]}%`;
                break;
            case queryOperators.ENDWITH:
                regex = `%${like[key]}`;
                break;
            case queryOperators.INCLUDES:
                regex = `%${like[key]}%`;
                break;
            default:
                break;
        }
        const query = `${this.tableAlias}.${column} LIKE '${regex}' `;
        return query;
    }
    buildIn(inArray) {
        const key = Object.keys(inArray[0])[0];
        let val = {};
        val[key] = '';
        let column = Object.keys(parseColumnName(val, this.tableName).sqlValues)[0];
        const values = inArray.map((v) => { return `${parseSQLTypeForColumn({ name: key, value: v[key] }, this.tableName)}` })
        const query = `${this.tableAlias}.${column} IN (${values.join(',')})`
        return query;
    }
}

const convert = new ConvertQueryToSQLCondition()

const getConverter = (table) => {
    convert.setTable(table)
    return convert
}


module.exports = { getConverter } 