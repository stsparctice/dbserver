const { types } = require('./config-objects')
const notifictaions = require('../../config/serverNotifictionsConfig.json')
const DBconfig = require('../../config/DBconfig.json');
const { DBType } = require('../../utils/types');

function getTableFromConfig(tableName, config = DBconfig) {
    try {
        if (typeof tableName !== 'string') {
            let error = notifictaions.find(({ status }) => status === 519);
            error.description = 'The table name should be of type string';
            throw error;
        }
        let tables;
        try {
            let sql = config.find(db => db.database === DBType.SQL);
            tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 600);
            error.description += '(check the config file).';
            throw error;
        }
        let table = tables.find(tbl => tbl.MTDTable.name.sqlName === tableName);
        if (!table) {
            let error = notifictaions.find(n => n.status === 512);
            error.description = `Table: ${tableName} does not exist.`;
            throw error;
        }
        return table;
    }
    catch (error) {
        throw error;
    }
}

function getSqlTableColumnsType(tablename, config=DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config)
        let columns = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))

        return columns
    }
    catch (error) {
        console.log({error})
        throw error
    }
};

function getReferencedColumns(tablename, config=DBconfig) {
    let columns;
    try {
        const table = getTableFromConfig(tablename, config);
        columns = table.columns.filter(col => col.reference).map(col => ({ name: col.sqlName, ref: col.reference }));
    }
    catch (err) {
        throw err;
    }
    return columns;
}

function getTableAccordingToRef(tablename, config = DBconfig) {
    let columns;
    try {
        const table = getTableFromConfig(tablename, config);
        columns = table.columns.filter(col => col.type.toLowerCase().includes('reference'));
        columns = columns.map(col => ({ name: col.sqlName, ref: col.type.slice(col.type.indexOf('tbl_'), col.type.lastIndexOf('(')) }));
    }
    catch (err) {
        throw err;
    }
    return columns;
}

function getForeignTableAndDefaultColumn(tablename, field, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        let foreignTableName;
        try {
            const column = table.columns.find(c => c.name.toLowerCase() === field.toLowerCase());
            const { type } = column;
            foreignTableName = type.toUpperCase().split(' ').find(w => w.includes('TBL_'));
            let index = foreignTableName.indexOf('(');
            foreignTableName = foreignTableName.slice(0, index);
        }
        catch {
            let error = notifictaions.find(n => n.status === 515);
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

function getTableColumnsName(tablename, config = DBconfig) {
    let columns;
    try {
        const table = getTableFromConfig(tablename, config);
        columns = table.columns.map(col => col.sqlName);
    }
    catch (err) {
        throw err;
    }
    return columns;
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
        const defaultColumn = getTableFromConfig(tableName).MTDTable.defaultColumn;
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
        let col = x.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
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
    const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    const result = columns.map((column) => (
        {
            tableName: column.type.slice(column.type.toLowerCase().indexOf('tbl'), column.type.lastIndexOf('('))
            , column: column.sqlName, type: column.type
        }
    ))
    return result;
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

function parseColumnSQLType(object, tabledata){
    const props = Object.entries(object)
    let arr = props.map(p => parseOneColumnSQLType({ name: p[0], value: p[1] }, tabledata))
    return arr
}


function parseOneColumnSQLType(column, tabledata) {
    
    const props = Object.keys(column)
    if(!props.includes('name')|| !props.includes('value')){
        const error=notifictaions.find(n=>n.status===519)
        error.description = `Argument column must be an object with the following keys: 'name' and 'value`
        throw error
    }
    let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == column.name.trim().toLowerCase()).type
    let parse
    try {
        const typename = type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '').trim()
        parse = types[typename]
    }
    catch {
        let error = notifictaions.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    const val = parse.parseNodeTypeToSqlType(column.value);
    return val
}

module.exports = {
    getTableFromConfig,
    getSqlTableColumnsType,
    getReferencedColumns,
    getTableAccordingToRef,
    getForeignTableAndDefaultColumn,
    getTableColumnsName,
    getTableAlias,
    getDefaultColumn,
    getColumnAlias,
    getPrimaryKeyField,
    getForeginKeyColumns,
    getObjectWithFieldNameForPrimaryKey,
    parseColumnSQLType,
    parseOneColumnSQLType
}
