const config = require('../../config.json')
const types = require('./config-objects')
require('dotenv');
const { SQL_DBNAME } = process.env;

function getSqlTableColumnsType(tablename) {
    try {
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let x = tables.find(table => table.MTDTable.name.sqlName.toLowerCase() == tablename.toLowerCase())
        let col = x.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
        return col
    }
    catch {
        throw new Error('Have mistake in config.json')
    }
};

function parseSQLType(obj, tabledata) {
    console.log({ obj });
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]]) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
                let parse
                try {
                     parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
                } 
                catch  {
                    throw new Error(`Type: ${type} is not exsist.`)
                }
                str.push(parse.parseNodeTypeToSqlType(obj[keys[i]]))
            }
            else {
                str.push('NULL')
            }
        }
        return str
    } 
    catch  {
        throw new Error('Object is not valid')
    }
}

const readJoin = async (baseTableName, baseColumn) => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    const myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    let selectColumns = []
    const buildJoin = (tableName, column, prevTableAlias) => {
        const connectionTable = tables.filter(({ columns }) => columns.filter(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).length != 0);
        let join = '';
        if (tableName === myTableNameSQL) {
            let alias1 = tables.find(({ MTDTable }) => MTDTable.name.sqlName == tableName).MTDTable.name.name;
            join = `FROM ${tableName} ${alias1} `
            prevTableAlias = alias1;
            let columns = tables.find(({ MTDTable }) => MTDTable.name.sqlName == tableName).columns.map(({ sqlName }) => { return sqlName });
            selectColumns.push({ alias: prevTableAlias, columns });
        }
        if (connectionTable.length > 0)
            for (let table of connectionTable) {
                let tableJoin = table.MTDTable.name.sqlName;
                let alias = table.MTDTable.name.name;
                let columns = table.columns.map(({ name }) => { return name });
                selectColumns.push({ alias, columns })
                let columnToEqual = [table].map(({ columns }) => columns.find(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).sqlName)[0];
                let columnToJoin = [table].map(({ columns }) => columns.find(({ type }) => type.includes('PRIMARY KEY')).sqlName)[0];
                join = `${join} JOIN ${tableJoin} ${alias} ON ${alias}.${columnToEqual}=${prevTableAlias}.${column} ${buildJoin(tableJoin, columnToJoin, alias)}`
            }
        else {
            join = ``;
        }
        return join;
    }
    let result = buildJoin(myTableNameSQL, baseColumn);
    let select = "";
    selectColumns.forEach(s => {
        s.columns.forEach(c => {
            select = `${select} ${s.alias}.${c} as ${s.alias}_${c},`;
        });
    });
    result = `USE ${SQL_DBNAME} SELECT ${select.slice(0, select.length - 1)} ${result}`;
    console.log(result);
    return result;
};

function getPrimaryKeyField(tablename) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let x = tables.find(table => table.MTDTable.name.sqlName.toLowerCase() == tablename.toLowerCase())
    let col = x.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    if (col) {
        return col.sqlName
    }
    return false
}

function getObjectWithFeildNameForPrimaryKey(tablename, fields, id) {
    let primarykey = getPrimaryKeyField(tablename)
    if (primarykey) {
        let where = {}
        where[primarykey] = id
        return { tablename, columns: fields, where }
    }
    return false
}

module.exports = { getSqlTableColumnsType, parseSQLType, readJoin, getPrimaryKeyField, getObjectWithFeildNameForPrimaryKey };
