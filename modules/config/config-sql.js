const { types } = require('./config-objects')
const notifications = require('../../config/serverNotifictionsConfig.json')
const DBconfig = require('../../config/DBconfig.json');
const { DBType } = require('../../utils/types');
const { removeKeysFromObject } = require('../../utils/code');
// const { getDBTypeAndName } = require('./get-config');

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

function existsEntityInSql(entityName, config = DBconfig) {
    const tables = getAllSQLTablesFromConfig(config)
    const entitiesNames = tables.map(({ MTDTable }) => MTDTable.name)
    return entitiesNames.includes(entityName)
}

function getTableFromConfig(tableName, config = DBconfig) {
    try {
        if (typeof tableName !== 'string') {
            let error = notifications.find(({ status }) => status === 519);
            error.description = 'The table name should be of type string';
            throw error;
        }
        let tables = getAllSQLTablesFromConfig(config);

        let table = tables.find(tbl => tbl.MTDTable.name.sqlName.trim() === tableName || tbl.MTDTable.name.name.trim() === tableName);
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
        const columns = table.columns.filter(col => col.foreignkey).map(col => {
            const { ref_table, ref_column } = col.foreignkey
            const refTable = getTableFromConfig(ref_table, config)
            const column = refTable.columns.find(({ sqlName }) => sqlName === ref_column)
            return {
                table: { sqlName: table.MTDTable.name.sqlName, alias: table.MTDTable.name.name },
                sqlName: col.sqlName,
                ref: { ...col.foreignkey, name: column.name }
            }
        });
        return columns;
    }
    catch (err) {
        throw err;
    }
}

function getInnerReferencedColumns(tablename, primarykey = getPrimaryKeyField, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        const columns = table.columns.filter(col => col.reference).map(({ name, sqlName, reference }) => ({
            name, sqlName, reference
            // foreignkey: {
            //     ref_column: (object) => primarykey(object[reference]),
            //     ref_table: (object) => object[reference]
            // }
        }))
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

function getForeignTableDefaultColumn(tablename, config = DBconfig) {
    try {
        const foreignTable = getTableFromConfig(tablename, config);
        const { defaultColumn } = foreignTable.MTDTable;
        return defaultColumn;
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

function getTableSQLName(alias) {
    try {
        const tableName = getTableFromConfig(alias).MTDTable.name.sqlName;
        return tableName;
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

function getIdentityColumns(tablename) {
    try {
        let x = getTableFromConfig(tablename)
        let col = x.columns.filter(col => (col.isIdentity))
        if (col) {
            return col.map(({ sqlName }) => sqlName)
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
        const connectedTables = allTables.filter(({ columns }) =>
            columns.find(({ foreignkey }) =>
                foreignkey && foreignkey.ref_table === tableName
            )
        )
        return connectedTables
    }
    catch (error) {
        throw error
    }
}

function getConnectionBetweenEntities(tableName) {
    const connectedTables = getConnectedEntities(tableName)
    const connectedFields = connectedTables.map(({ MTDTable, columns }) => ({
        tableName: MTDTable.name.sqlName, columns: columns.filter(({ foreignkey }) => foreignkey && foreignkey.ref_table === tableName)
            .map(({ sqlName, foreignkey, checkUpdates }) => ({ sqlName, referenceField: foreignkey.ref_column, update:checkUpdates }))
    }))

    return connectedFields
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
    console.log({ type })
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

function buildFullReferences(table) {
    const mainTable = { sqlName: table.MTDTable.name.sqlName, alias: table.MTDTable.name.name }
    mainTable.columns = getTableColumnsSQLName(mainTable.sqlName)
    let references = getConnectedEntities(mainTable.sqlName)
    references = references.map(table => {
        let foreignkeys = getSQLReferencedColumns(table.MTDTable.name.sqlName)
        return { table, connectedTable: mainTable.alias, foreignkeys: foreignkeys.find(({ ref }) => ref.ref_table === mainTable.sqlName) }
    })

    mainTable.references = references.map(({ table, ...rest }) => ({ ...rest, references: [buildFullReferences(table)] }))
    return mainTable
}

const readJoin = (baseTableName, baseColumn, config = DBconfig) => {
    const table = getTableFromConfig(baseTableName)
    // const tables = config.find(f => f.database === "sql").dbobjects.find(({ type }) => type === "Tables").list
    let myTableNameSQL
    try {
        myTableNameSQL = table.MTDTable.name.sqlName;
    }
    catch {
        let error = notifications.find(n => n.status === 512)
        error.description = `BaseTableName: ${baseTableName} does not exsist.`
        throw error
    }
    try {
        baseColumn = table.columns.find(({ name }) => name === baseColumn).sqlName;
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

function parseEntityToSqlObject(object, entity, config = DBconfig) {
    const columns = getTableColumns(entity, config)
    const removeKeys = []
    let sqlObject = columns.reduce((obj, col) => {
        const { name, sqlName } = col

        if (object[name] !== undefined) {
            obj[sqlName] = object[name]
        }
        if (object[sqlName] !== undefined) {
            obj[sqlName] = object[sqlName];
        }
        if (Array.isArray(obj[sqlName])) {
            obj[sqlName] = undefined
            removeKeys.push(sqlName)
        }

        if (obj[sqlName] !== undefined && obj[sqlName] !== null && typeof obj[sqlName] === 'object') {
            console.log({col});
            console.log({x: obj[sqlName]});
            const { foreignkey } = col;
            const entityName = getColumnAlias(foreignkey.ref_table, foreignkey.ref_column)
            obj[sqlName] = obj[sqlName][entityName]
        }
        return obj;
    }, {})

    sqlObject = removeKeysFromObject(sqlObject, removeKeys)
    return sqlObject;

}

function parseSqlListToEntities(list, entity, config = DBconfig) {
    list = list.map(item => parseSqlObjectToEntity(item, entity, config))
    return list
}

function parseSqlObjectToEntity(object, entity, config = DBconfig) {
    const columns = getTableColumns(entity, config)
    let objectKeys = Object.keys(object)
    let entityObject = columns.reduce((obj, col) => {
        const { name, sqlName } = col
        if (object[sqlName] !== undefined) {
            if (typeof object[sqlName] === 'object') {
                if (col.foreignkey) {
                    obj[name] = parseSqlObjectToEntity(object[sqlName], col.foreignkey.ref_table)
                }
                else {
                    if (col.reference) {
                        let ref_table = object[col.reference]
                        obj[name] = parseSqlObjectToEntity(object[sqlName], ref_table)
                    }
                    else {
                        if (object[sqlName]) {
                            obj[name] = object[sqlName]
                        }
                        else {
                            obj[name] = undefined
                        }
                    }

                }
            }
            else {
                obj[name] = object[sqlName]
            }
        }
        let removeIndex = objectKeys.indexOf(sqlName)
        if (removeIndex !== -1)
            objectKeys.splice(removeIndex, 1)
        return obj
    }, {})
    for (let key of objectKeys) {
        if (Array.isArray(object[key]))
            entityObject[key] = parseSqlListToEntities(object[key], key)
        else {
            // entityObject[key] = parseSqlObjectToEntity(object[key], key)
            entityObject[key] = object[key];
        }
    }
    return entityObject
}

module.exports = {
    getTableFromConfig,
    existsEntityInSql,
    readJoin,
    getSqlTableColumnsType,
    getSQLReferencedColumns,
    getTableAccordingToRef,
    getForeignTableDefaultColumn,
    getInnerReferencedColumns,
    getTableColumns,
    getTableColumnsSQLName,
    getTableAlias,
    getTableSQLName,
    getDefaultColumn,
    getColumnAlias,
    getPrimaryKeyField,
    getIdentityColumns,
    getForeginKeyColumns,
    getConnectedEntities,
    getConnectionBetweenEntities,
    getObjectWithFieldNameForPrimaryKey,
    parseColumnSQLType,
    parseEntityToSqlObject,
    parseOneColumnSQLType,
    parseSqlObjectToEntity,
    buildFullReferences
}
