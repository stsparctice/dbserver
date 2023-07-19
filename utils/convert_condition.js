const { parseSQLTypeForColumn, getTableFromConfig, getAlias } = require('../modules/config/config')
require('dotenv');
const { SQL_DBNAME } = process.env;
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
    let subFilter = {}
    for (let key in condition) {
        if (condition[key] instanceof Array) {
            subFilter[`$${key.toLowerCase()}`] = condition[key].map(o => convertToMongoFilter(o))
        }
        else {
            subFilter[key] = condition[key]
        }
    }
    return subFilter
}
const viewConnectionsTables = ({tableName, condition = {}, topn}) => {
    try {
        const myTable = getTableFromConfig(tableName)
        const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
        let columnsSelect = [{ tableName: myTable.MTDTable.name.name, columnsName: [...myTable.columns.map(({ sqlName }) => sqlName)] }];
        let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
        columns.forEach(column => {
            const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
            const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
            const thisTable = getTableFromConfig(tableToJoin);
            const alias = thisTable.MTDTable.name.name;
            columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
            join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;
        });
        if (Object.keys(condition).length > 0) {

            let conditionString = convertToSqlCondition(getAlias(tableName), condition);

            join = `${join} WHERE ${conditionString}`;
        }
        let select = ``;
        columnsSelect.forEach(cs => {
            cs.columnsName.forEach(cn => {
                select = `${select} ${cs.tableName}.${cn},`;
            })
        })
        select = select.slice(0, select.length - 1);
        return `use ${SQL_DBNAME} SELECT TOP ${topn} ${select} FROM ${join}`;
    } catch (error) {
        console.log(error);
    }
}
module.exports = { convertToMongoFilter,  viewConnectionsTables }
