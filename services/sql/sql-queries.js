require('dotenv')
const { getTableFromConfig, getPrimaryKeyField, getTableAlias, getDefaultColumn } = require('../../modules/config/config-sql')
const { convertQueryToSQLCondition } = require('../../services/sql/sql-convert-query-to-condition');
const {  parseColumnName } = require('../../utils/parse_name');
const { SQL_DBNAME } = process.env


const autoCompleteQuery = ({ entity, column }, condition) => {
    try {
        let obj = {}
        const { entityName } = parseDBname(entity);
        obj.tableName = entityName
        let val = {}
        val[column] = ''
        obj.columns = `${Object.keys(parseColumnName(val, entityName))}, ${getPrimaryKeyField(obj.tableName)}`;
        console.log({ condition: condition.LIKE });
        obj.condition = convertQueryToSQLCondition(getTableFromConfig(obj.tableName), condition);
        obj.n = 10;
        return obj;
    }
    catch (error) {
        console.log(error);
        throw error
    }
}

const viewConnectionsTables = ({ tableName, condition = {}, topn, skip = 0 }) => {
    try {
        console.log({ tableName });
        const myTable = getTableFromConfig(tableName)
        const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
        let columnsSelect = [{ tableName: myTable.MTDTable.name.name, columnsName: myTable.columns.map(({ sqlName }) => sqlName)}];
        let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
        columns.forEach(column => {
            console.log(column)
            const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
            const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
            const joinTable = getTableFromConfig(tableToJoin);
            const alias = getTableAlias(joinTable);
            const defaultcolumn = getDefaultColumn(joinTable)
            columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} AS FK_${column.name}_${columnToJoin}`, `${defaultcolumn} AS FK_${column.name}_${defaultcolumn}`] }];
            join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;
        });
        if (Object.keys(condition).length > 0) {

            let conditionString = convertQueryToSQLCondition(getTableFromConfig(tableName), condition);

            join = `${join} WHERE ${conditionString}`;
        }
        let select = ``;
        columnsSelect.forEach(cs => {
            cs.columnsName.forEach(cn => {
                select = `${select} ${cs.tableName}.${cn},`;
            })
        })
        select = select.slice(0, select.length - 1);
        const primaryKey = getPrimaryKeyField(tableName);
        join = `${join} ORDER BY ${primaryKey} ASC OFFSET ${skip} ROWS FETCH NEXT ${topn} ROWS ONLY`
        return `USE ${SQL_DBNAME} SELECT ${select} FROM ${join}`;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


const convertType = (column1, column2) => {
    const table1 = getTableFromConfig(parseDBname(column1.tableName).entityName);
    const current1 = table1.columns.find(({ sqlName }) => sqlName === column1.column);
    const table2 = getTableFromConfig(parseDBname(column2.tableName).entityName);
    const current2 = table2.columns.find(({ sqlName }) => sqlName === column2.column);
    let result = ``
    if (current1.type.toLowerCase().includes('nvarchar') && current2.type.toLowerCase().includes('int'))
        result = `${column1.tableName}.${column2.column} = CONVERT(NVARCHAR,${column2.tableName}.${column2.column})`;
    else {

        if (current1.type.toLowerCase().includes('int') && current2.type.toLowerCase().includes('nvarchar')) {
            result = `CONVERT(NVARCHAR,${column1.tableName}.${column1.column}) = ${column2.tableName}.${column2.column}`
        }
        else {
            result=`${column1.tableName}.${column1.column} = ${column2.tableName}.${column2.column}`
        }
    }
    return result;

}

module.exports = { viewConnectionsTables, autoCompleteQuery,convertType };