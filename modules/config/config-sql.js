const { types } = require('./config-objects')
const notifications = require('../../config/serverNotifictionsConfig.json')
const DBconfig = require('../../config/DBconfig.json');
const { DBType } = require('../../utils/types');

function getAllSQLTablesFromConfig(config = DBconfig) {
    try {
        let sql = config.find(db => db.database === DBType.SQL);
        tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
        return tables
    }
    catch {
        let error = notifications.find(({ status }) => status === 600);
        error.description += '(check the config file).';
        throw error;
    }
}

function getTableFromConfig(tableName, config = DBconfig) {
    try {
        if (typeof tableName !== 'string') {
            let error = notifications.find(({ status }) => status === 519);
            error.description = 'The table name should be of type string';
            throw error;
        }
        let tables = getAllSQLTablesFromConfig(config);

        let table = tables.find(tbl => tbl.MTDTable.name.sqlName === tableName || tbl.MTDTable.name.name.trim() === tableName);
        if (!table) {
            let error = notifications.find(n => n.status === 512);
            error.description = `Table: ${tableName} does not exist.`;
            throw error;
        }
        return table;
    }
    catch (error) {
        throw error;
    }
}

function parseColumnName(values, table) {
    try {
        let columns = getTableColumns(table)
        let sqlValues = undefined;
        let noSqlValues = undefined;
        if (Array.isArray(values)) {
            sqlValues = []
            noSqlValues = []
            for (let name of values) {
                let column = columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() ||
                    column.sqlName.trim().toLowerCase() == name.trim().toLowerCase());
                if (column) {
                    sqlValues = [...sqlValues, column.sqlName];
                }
                else {
                    noSqlValues = [...noSqlValues, name];
                }
            }
        }
        else {
            sqlValues = {};
            noSqlValues = {};
            for (let name in values) {
                let column = columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() ||
                    column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
                if (column) {
                    sqlValues[column.sqlName] = values[name]
                }
                else {
                    noSqlValues[name] = values[name];
                }
            }
        }
        // if (error.length > 0) {
        //     let description = `The column${error.length > 1 ? 's' : ''}: ${error.join(', ')} ${error.length > 1 ? 'do' : 'does'} not exist.`
        //     error = notifications.find(n => n.status === 514)
        //     error.description = description
        //     throw error
        // }
        return { sqlValues, noSqlValues }

    }
    catch (error) {
        throw error
    }

}

function getSqlTableColumnsType(tablename, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config)
        let columns = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.type }))
        return columns
    }
    catch (error) {
        console.log({ error })
        throw error
    }
};

function getSQLReferencedColumns(tablename, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        const columns = table.columns.filter(col => col.foreignkey).map(col => ({ name: col.sqlName, ref: col.foreignkey }));
        return columns;
    }
    catch (err) {
        throw err;
    }
}

function getTableAccordingToRef(tablename, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        let columns = table.columns.filter(col => col.foreignkey);
        columns = columns.map(col => ({ name: col.sqlName, ref: col.foreignkey.ref_table }));
        return columns;
    }
    catch (err) {
        throw err;
    }
}

function getForeignTableAndDefaultColumn(tablename, field, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        let foreignTableName;
        try {
            const column = table.columns.find(c => c.name.toLowerCase() === field.toLowerCase());
            const { foreignkey } = column;
            foreignTableName = foreignkey.ref_table;
        }
        catch {
            let error = notifications.find(n => n.status === 515);
            error.description = `Field: ${field} does not exsist in table: ${tablename}.`;
            throw error;
        }
        const foreignTable = getTableFromConfig(foreignTableName.toLowerCase(), config);
        const { defaultColumn } = foreignTable.MTDTable;
        return { foreignTableName, defaultColumn };
    }
    catch (error) {
        throw error;
    }
}

function getTableColumnsSQLName(tablename, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        let columns = table.columns.map(col => col.sqlName);
        return columns;
    }
    catch (err) {
        throw err;
    }
}

function getTableColumns(tableName, config = DBconfig) {
    try {
        const table = getTableFromConfig(tableName, config);
        let columns = table.columns;
        return columns;
    }
    catch (err) {
        throw err;
    }
}

function getTableAlias(tableName) {
    try {
        const tablealias = getTableFromConfig(tableName).MTDTable.name.name;
        return tablealias;
    }
    catch (error) {
        throw error
    }
}

function getDefaultColumn(tableName) {
    try {
        const table = getTableFromConfig(tableName);
        const defaultColumn = table.MTDTable.defaultColumn;
        return defaultColumn
    }
    catch (error) {
        throw error
    }

}

function getColumnAlias(tableName, column) {
    try {
        const table = getTableFromConfig(tableName);
        const alias = table.columns.find(({ sqlName }) => sqlName === column).name;
        return alias;
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(tablename) {
    try {
        let x = getTableFromConfig(tablename)
        let col = x.columns.find(col => (col.primarykey))
        if (col) {
            return col.sqlName
        }
        return false
    }
    catch (error) {
        throw error
    }
}

function getForeginKeyColumns(tableName) {
    const myTable = getTableFromConfig(tableName)
    const columns = myTable.columns.filter(({ type }) => type.foreignkey);
    const result = columns.map(({ foreignkey }) => (
        {
            tableName: foreignkey.ref_table
            , column: foreignkey.ref_column
        }
    ))
    return result;
}

function getConnectedEntities(tableName, config = DBconfig) {
    try {
        const allTables = getAllSQLTablesFromConfig(config);
        const connectedTables = allTables.filter(({ columns })=> columns.find(({foreignkey})=>foreignkey&& foreignkey.ref_table === tableName))
        return connectedTables
    }
    catch (error) {
        throw error
    }
}

function getObjectWithFieldNameForPrimaryKey(tablename, fields, id) {
    try {

        let primarykey = getPrimaryKeyField(tablename)
        if (primarykey) {
            const where = {}
            where[primarykey] = id
            return { tablename, columns: fields, where }
        }
        return false
    }
    catch (error) {
        throw error
    }
}

function parseColumnSQLType(object, tabledata) {
    const props = Object.entries(object)
    let arr = props.map(p => parseOneColumnSQLType({ name: p[0], value: p[1] }, tabledata))
    return arr
}




function parseOneColumnSQLType({ name, value }, tabledata) {
    if (!name || value === undefined) {
        const error = notifications.find(n => n.status === 519)
        error.description = `Argument column must be an object with the following keys: 'name' and 'value`
        throw error
    }
    let col = tabledata.find(td => td.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
    if (col === undefined) {
        let err = notifications.find(n => n.status === 514)
        err.description = `The column ${name} does not exist in sql`
        throw err
    }
    const type = col.type
    let parse
    try {
        const typename = type
        parse = types[typename]
    }
    catch {
        let error = notifications.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    if (value !== undefined) {
        const val = parse.parseNodeTypeToSqlType(value);
        return val
    }
    else {
        return value
    }
}

const readJoin = async (baseTableName, baseColumn, config = DBconfig) => {
    const tables = config.find(f => f.database === "sql").dbobjects.find(({ type }) => type === "Tables").list
    let myTableNameSQL
    try {
        myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    }
    catch {
        let error = notifications.find(n => n.status === 512)
        error.description = `BaseTableName: ${baseTableName} does not exsist.`
        throw error
    }
    try {
        baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    }
    catch {
        let error = notifications.find(n => n.status === 514)
        error.description = `BaseColumn: ${baseColumn} does not exsist in table ${baseTableName}.`
        throw error
    }
    let selectColumns = []
    const buildJoin = (tableName, column, prevTableAlias, config = DBconfig) => {
        const connectionTable = tables.filter(({ columns }) => columns.filter(col => col.foreignkey))

        let join = '';
        if (tableName === myTableNameSQL) {
            let alias1 = tables.find(({ MTDTable }) => MTDTable.name.sqlName === tableName).MTDTable.name.name;
            join = `FROM ${tableName} ${alias1} `
            prevTableAlias = alias1;

            let columns = tables.find(({ MTDTable }) => MTDTable.name.sqlName === tableName).columns.map(({ sqlName }) => sqlName);
            selectColumns.push({ alias: prevTableAlias, columns });
        }
        console.log({ connectionTable })
        if (connectionTable.length > 0)
            for (let table of connectionTable) {
                let tableJoin = table.MTDTable.name.sqlName;
                let alias = table.MTDTable.name.name;
                let columns = table.columns.map(({ name }) => name);
                selectColumns.push({ alias, columns })
                let foreignkeyColumns = [table].map(({ columns }) => columns.find(({ foreignkey }) => foreignkey && foreignkey.ref_table === tableName && foreignkey.ref_column === column).sqlName)[0];
                let columnToJoin = [table].map(({ columns }) => columns.find(({ primarykey }) => primarykey).sqlName)[0];
                if (join.includes(`JOIN ${tableJoin} ${alias}`)) {
                    join = `${join} ${buildJoin(tableJoin, columnToJoin, alias, config = config)}`
                }
                else {
                    join = `${join} LEFT JOIN ${tableJoin} ${alias} ON ${alias}.${foreignkeyColumns}=${prevTableAlias}.${column} ${buildJoin(tableJoin, columnToJoin, alias, config = config)}`
                }
            }
        else {
            join = ``;
        }
        return join;
    }
    let result = buildJoin(myTableNameSQL, baseColumn, config = config);
    let select = "";
    selectColumns.forEach(s => {
        s.columns.forEach(c => {
            select = `${select} ${s.alias}.${c} as ${s.alias}_${c},`;
        });
    });
    result = `USE ${SQL_DBNAME} SELECT ${select.slice(0, select.length - 1)} ${result}`;
    return result;
}

function parseSqlObjectToEntity(object, entity, config = DBconfig) {
    const columns = getTableColumns(entity, config)
    const entityObject = columns.reduce((obj, col) => {
        const { name, sqlName } = col

        if (object[sqlName] !== undefined) {
            if (col.foreignkey) {
                obj[name] = parseSqlObjectToEntity(object[sqlName], col.foreignkey.ref_table)
            }
            else {
                obj[name] = object[sqlName]
            }

        }
        return obj
    }, {})
    return entityObject
}

module.exports = {
    getTableFromConfig,
    readJoin,
    parseColumnName,
    getSqlTableColumnsType,
    getSQLReferencedColumns,
    getTableAccordingToRef,
    getForeignTableAndDefaultColumn,
    getTableColumns,
    getTableColumnsSQLName,
    getTableAlias,
    getDefaultColumn,
    getColumnAlias,
    getPrimaryKeyField,
    getForeginKeyColumns,
    getConnectedEntities,
    getObjectWithFieldNameForPrimaryKey,
    parseColumnSQLType,
    parseOneColumnSQLType,
    parseSqlObjectToEntity
}
