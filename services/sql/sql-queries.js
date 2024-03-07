require('dotenv')
const { types } = require('../../modules/config/config-objects');
const { getTableFromConfig, getPrimaryKeyField, getTableAlias, getDefaultColumn, parseColumnName, getSqlTableColumnsType, parseOneColumnSQLType, getIdentityColumns, parseEntityToSqlObject } = require('../../modules/config/config-sql')
const { getDBTypeAndName } = require('../../modules/config/get-config');
const { getConverter } = require('../../services/sql/sql-convert-query-to-condition');
const { isEmpyObject, removeKeysFromObject } = require('../../utils/code');
const { DBType } = require('../../utils/types');
const { SQL_DBNAME } = process.env


const autoCompleteQuery = ({ tablename, column }, condition) => {
    console.log({ tablename, column, condition })
    try {
        const convert = getConverter(tablename)
        let obj = {}
        obj.tableName = tablename
        let val = {}
        val[column] = ''
        obj.columns = `${Object.keys(parseColumnName(val, tablename).sqlValues)}, ${getPrimaryKeyField(obj.tableName)}`;
        obj.condition = convert.convertCondition(condition);
        obj.n = 10;
        return obj;
    }
    catch (error) {
        console.log(error);
        throw error
    }
}

const createQuery = (tableName, columns, values) => {
    const primarykey = getPrimaryKeyField(tableName)
    let query = `use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}); SELECT @@IDENTITY ${primarykey}`
    console.log({ query });
    return { query, returnValue: primarykey };

}

const updateQuery = (obj) => {

    if (isEmpyObject(obj)) {
        const error = notifications.find(n => n.status === 400)
        throw error
    }
    try {
        const convert = getConverter(obj.tableName)
        const condition = convert.convertCondition(obj.condition)
        const alias = getTableAlias(obj.tableName)
        const identityColumns = getIdentityColumns(obj.tableName);
        obj.sqlValues = removeKeysFromObject(obj.sqlValues, identityColumns)
        obj.sqlValues = parseEntityToSqlObject(obj.sqlValues, obj.tableName);
        console.log(obj.sqlValues);
        const valEntries = Object.entries(obj.sqlValues);
        const tableData = getSqlTableColumnsType(obj.tableName)
        const updateValues = valEntries.map(c => `${alias}.${c[0]} =  ${parseOneColumnSQLType({ name: c[0], value: c[1] }, tableData)}`).join(',')
        const query = `use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.tableName} ${alias} WHERE ${condition}`
        return query
    }
    catch (error) {
        console.log(error)
        throw error
    }
}

const buildReadQuey = ({ tableName, columns = '*', condition = '1=1', n = 100 }) => {
    const convert = getConverter(tableName)
    condition = convert.convertCondition(condition)
    query = `USE ${SQL_DBNAME} SELECT TOP ${n} ${columns} FROM ${tableName} AS ${getTableAlias(tableName)} where ${condition}`
    return query;
}

const buildSelectPart = (columns, alias, references) => {
    let selectpart = columns.map(col => `${alias}.${col} as ${alias}_${col}`).join(', ')
    if (references !== undefined && Array.isArray(references) && references.length > 0) {
        for (ref of references) {
            selectpart = [selectpart, ref.references.map(item => buildSelectPart(item.columns, item.alias, item.references))].join(', ')
        }
    }
    return selectpart
}

const buildJoinPart = ({ sqlName, alias, references, foreignkeys }) => {
    let joinpart = ''
    for (let ref of references) {
        if (ref.connectedTable === alias) {
            joinpart += ` left join ${ref.foreignkeys.table.sqlName} ${ref.foreignkeys.table.alias}  on ${ref.foreignkeys.table.alias}.${ref.foreignkeys.sqlName} = ${ref.connectedTable}.${ref.foreignkeys.ref.ref_column} `
        }
        if (ref.references.length > 0) {
            for (let item of ref.references) {
                joinpart += buildJoinPart(item)

            }
        }
    }
    return joinpart
}
const readFullEntityQuery = ({ mainTable, condition }) => {
    const { sqlName, alias, columns, foreignkeys, references } = mainTable
    let selectPart = ` use ${SQL_DBNAME} select ${buildSelectPart(columns, alias, references)}`
    let joinPart = `from ${sqlName}  ${alias} ${buildJoinPart({ sqlName, alias, references })}`
    let conditionPart = `where ${condition.table}.${condition.field} = ${condition.value}`
    return `${selectPart} ${joinPart} ${conditionPart}`
}

const getSelectSqlQueryWithFK = ({ tableName, fields = [], condition = {}, topn = 50, skip = 0 }) => {
    try {
        const myTable = getTableFromConfig(tableName)
        const foreignKeyColumns = myTable.columns.filter((col) => col.foreignkey);
        let columnsSelect = [{
            tableName: myTable.MTDTable.name.name, columnsName: myTable.columns.filter(({ sqlName, name }) => {
                if (fields.length === 0) {
                    return true
                }
                else {
                    return fields.includes(sqlName) || fields.includes(name)
                }
            }).map(({ sqlName }) => sqlName)
        }];
        let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
        console.log({ join });
        let joinTables = []
        if (foreignKeyColumns.length > 0) {
            foreignKeyColumns.forEach(column => {
                let tableToJoin = column.foreignkey.ref_table;
                const columnToJoin = column.foreignkey.ref_column;
                let alias = getTableAlias(tableToJoin);
                const defaultcolumn = getDefaultColumn(tableToJoin)
                console.log({ defaultcolumn });
                if (joinTables.some(jt => jt.tableToJoin === tableToJoin)) {
                    let count = joinTables.filter(jt => jt.tableToJoin === tableToJoin).length
                    alias = `${alias}${count}`
                }
                columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} AS FK_${column.sqlName}_${columnToJoin}`, `${defaultcolumn} AS FK_${column.sqlName}_${defaultcolumn}`] }];
                // join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;

                joinTables.push({ tableToJoin, alias, columnToJoin, entity2: myTable.MTDTable.name.name, column2: column.sqlName })
            });
        }
        joinTables = joinTables.map(({ tableToJoin, alias, columnToJoin, entity2, column2 }) => `LEFT JOIN ${tableToJoin} ${alias} ON ${entity2}.${column2}=${alias}.${columnToJoin}`)
        join = `${join} ${joinTables.join(' ')}`
        if (Object.keys(condition).length > 0) {
            const convert = getConverter(myTable)
            let conditionString = convert.convertCondition(condition)

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
    console.log({ column1, column2 })
    const table1Type = getDBTypeAndName(column1.tableName);
    const table1Sql = table1Type.find(({ type }) => type === DBType.SQL)
    let table1 = {}
    if (table1Sql) {
        table1.table = getTableFromConfig(table1Sql.entityName);
        table1.current = table1.table.columns.find(({ sqlName }) => sqlName === column1.column);
    }
    const table2Type = getDBTypeAndName(column2.tableName);
    const table2Sql = table2Type.find(({ type }) => type === DBType.SQL)
    let table2 = {}
    if (table2Sql) {
        table2.table = getTableFromConfig(table2Sql.entityName);
        table2.current = table2.table.columns.find(({ sqlName }) => sqlName === column2.column);
    }
    let result = ``
    if (table1.current.type.type === 'NVARCHAR' && table2.current.type.type === 'INT')
        result = `${column1.tableName}.${column2.column} = CONVERT(NVARCHAR,${column2.tableName}.${column2.column})`;
    else {

        if (table1.current.type.type === 'INT' && table2.current.type.type === 'NVARCHAR') {
            result = `CONVERT(NVARCHAR,${column1.tableName}.${column1.column}) = ${column2.tableName}.${column2.column}`
        }
        else {
            result = `${column1.tableName}.${column1.column} = ${column2.tableName}.${column2.column}`
        }
    }
    return result;
}



module.exports = {
    getSelectSqlQueryWithFK,
    autoCompleteQuery,
    convertType,
    updateQuery,
    createQuery,
    buildReadQuey,
    readFullEntityQuery
};