const config = require('../../config/DBconfig.json')
const types = require('./config-objects')
require('dotenv');
const { SQL_DBNAME } = process.env;


function getTableFromConfig(tableName) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let table = tables.find(tbl => tbl.MTDTable.name.sqlName.toLowerCase() == tableName.toLowerCase() ||
        tbl.MTDTable.name.name.toLowerCase() == tableName.toLowerCase())
    return table

}

function getSqlTableColumnsType(tablename) {

    const table = getTableFromConfig(tablename)
    let col = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
    return col
};

function parseSQLType(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
                let parse
                try {
                    parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
                }
                catch {
                    throw new Error(`Type: ${type} does not exist.`)
                }
                const val = parse.parseNodeTypeToSqlType(obj[keys[i]]);
                str.push(val);
            }
            else {
                str.push('NULL')
            }
        }
        return str
    }
    catch {
        throw new Error('Object is not valid')
    }
}

function parseSQLTypeForColumn(col, tabledata) {
    console.log({ col })
    let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == col.name.trim().toLowerCase()).type
    let parse
    try {
        parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    }
    catch {
        throw new Error(`Type: ${type} does not exist.`)
    }
    const val = parse.parseNodeTypeToSqlType(col.value);
    return val
}



const readJoin = async (baseTableName, baseColumn) => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    const myTableNameSQL = tables.find(({ MTDTable }) => (MTDTable.name.name === baseTableName)).MTDTable.name.sqlName;
    console.log({ tables });
    console.log({ myTableNameSQL });
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
                if (join.includes(`JOIN ${tableJoin} ${alias}`)) {
                    join = `${join} ${buildJoin(tableJoin, columnToJoin, alias)}`
                }
                else {
                    join = `${join} LEFT JOIN ${tableJoin} ${alias} ON ${alias}.${columnToEqual}=${prevTableAlias}.${column} ${buildJoin(tableJoin, columnToJoin, alias)}`
                }
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

const viewConnectionsTables = (tableName, condition = "") => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    const myTable = tables.find(({ MTDTable }) => MTDTable.name.name === tableName);
    const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    let columnsSelect = [{ tableName: myTable.MTDTable.name.name, columnsName: [...myTable.columns.map(({ sqlName }) => { return sqlName })] }];
    let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
    columns.forEach(column => {
        const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
        const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
        const thisTable = tables.find(({ MTDTable }) => MTDTable.name.sqlName === tableToJoin);
        const alias = thisTable.MTDTable.name.name;
        columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [thisTable.MTDTable.default] }];
        join = `${join} JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    });
    if (condition.length > 0 && condition.includes('=')) {
        join = `${join} WHERE ${condition}`;
    }
    let select = ``;
    columnsSelect.forEach(cs => {
        cs.columnsName.forEach(cn => {
            select = `${select} ${cs.tableName}.${cn},`;
        })
    })
    select = select.slice(0, select.length - 1);
    return `SELECT ${select} FROM ${join}`;
}

function getPrimaryKeyField(tablename) {
    console.log("in getPrimaryKeyField");
    let sql = config.find(db => db.database == 'sql')
    console.log({ sql });
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    console.log({ tables });
    // console.log(tablename.toLowerCase(),'tablename.toLowerCase()');
    // let x = tables.find(table => (console.log(table.MTDTable.name.name.toLowerCase(),' mmmm')))
    let x = tables.find(table => (table.MTDTable.name.name.toLowerCase() == tablename.toLowerCase()||
    table.MTDTable.name.sqlName.toLowerCase() == tablename.toLowerCase()))

    console.log({ x });
    let col = x.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    console.log({col})
    if (col) {
        return col.sqlName
    }
    return false
}

function readRelatedData(tablename,id){
    // let sql = config.find(db => db.database == 'sql')
    // let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    // let x = tables.find(table => (table.MTDTable.name.name.toLowerCase() == tablename.toLowerCase()))

    
}

function isFull(tablename) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let x = tables.find(table => (table.MTDTable.name.name.toLowerCase() == tablename.toLowerCase()))
    let columns = x.columns.find(col => (col.reference))
    return columns
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

function getForeignTableAndColumn(tablename, field) {
    const table = getTableFromConfig(tablename)
    if (table) {
        const column = table.columns.find(c => c.name.toLowerCase() == field.toLowerCase())

        const { type } = column;

        let foreignTableName = type.toUpperCase().split(' ').find(w => w.includes('TBL_'))
        let index = foreignTableName.indexOf('(')
        foreignTableName = foreignTableName.slice(0, index)
        const foreignTable = getTableFromConfig(foreignTableName)
        if (foreignTable) {

            const { defaultColumn } = foreignTable.MTDTable

            return { foreignTableName, defaultColumn }
        }
    }
    return false

}

function convertFieldType(tablename, field, value) {

    const columns = getSqlTableColumnsType(tablename)
    let col = columns.find(c => c.sqlName.toLowerCase() === field)
    let parse = types[col.type.toUpperCase().replace(col.type.slice(col.type.indexOf('('), col.type.indexOf(')') + 1), '')]
    console.log({ columns })
    const ans = parse.parseNodeTypeToSqlType(value)
    return ans
}

module.exports = { getSqlTableColumnsType, parseSQLType, parseSQLTypeForColumn, readJoin,readRelatedData, isFull, convertFieldType, getPrimaryKeyField, viewConnectionsTables, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn };
