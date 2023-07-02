const config = require('../../config.json')
const types = require('./config-objects')
require('dotenv');
const { SQL_DBNAME } = process.env;


function getTableFromConfig(tableName) {
    try {
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let table = tables.find(tbl => tbl.MTDTable.name.sqlName.toLowerCase() == tableName.toLowerCase() ||
            tbl.MTDTable.name.name.toLowerCase() == tableName.toLowerCase())
        console.log({ table })
        return table
    }
    catch {
        throw new Error(`Table: ${tableName} is not exsist.`)
    }

}

function getSqlTableColumnsType(tablename) {
    try {
        const table = getTableFromConfig(tablename)
        let col = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
        return col
    }
    catch (error) {
        throw error
    }
};

function parseSQLType(obj, tabledata) {
console.log("functionb");

    console.log({ obj });
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
    catch (error) {
        if (error.message.includes('Type:')) {
            throw error
        }
        throw new Error('Object is not valid')
    }
}

const readJoin = async (baseTableName, baseColumn) => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    let myTableNameSQL
    try {
        myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    }
    catch {
        throw new Error(`BaseTableName: ${baseTableName} is not exsist.`)
    }
    try {
        baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    }
    catch {
        throw new Error(`BaseColumn: ${baseColumn} is not exsist in table ${baseTableName}.`)
    }
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

function getObjectWithFeildNameForPrimaryKey(tablename, fields, id) {
    try {

        let primarykey = getPrimaryKeyField(tablename)
        if (primarykey) {
            let where = {}
            where[primarykey] = id
            return { tablename, columns: fields, where }
        }
        return false
    }
    catch (error) {
        throw error
    }
}

function getForeignTableAndColumn(tablename, field) {
    try {

        const table = getTableFromConfig(tablename)
        if (table) {
            let foreignTableName
            try {

                const column = table.columns.find(c => c.name.toLowerCase() == field.toLowerCase())
                const { type } = column;
                foreignTableName = type.toUpperCase().split(' ').find(w => w.includes('TBL_'))
                let index = foreignTableName.indexOf('(')
                foreignTableName = foreignTableName.slice(0, index)
            }
            catch {
                throw new Error(`Field: ${field} is not exsist in table: ${tablename}.`)
            }
            const foreignTable = getTableFromConfig(foreignTableName)

            const { defaultColumn } = foreignTable.MTDTable
            return { foreignTableName, defaultColumn }

        }
        return false
    }
    catch (error) {
        throw error
    }

}

function convertFieldType(tablename, field, value) {
    try {

        const columns = getSqlTableColumnsType(tablename)
        let col = columns.find(c => c.sqlName.toLowerCase() === field)
        let parse = types[col.type.toUpperCase().replace(col.type.slice(col.type.indexOf('('), col.type.indexOf(')') + 1), '')]
        const ans = parse.parseNodeTypeToSqlType(value)
        console.log({ ans })
        return ans
    }
    catch (error) {
        throw error
    }

}

module.exports = { getSqlTableColumnsType, parseSQLType, readJoin, convertFieldType, getPrimaryKeyField, viewConnectionsTables, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn };
