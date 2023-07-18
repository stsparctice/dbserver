const config = require('../../config/DBconfig.json')
const types = require('./config-objects')
require('dotenv');
const { SQL_DBNAME } = process.env;
const notifictaions = require('../../config/serverNotifictionsConfig.json')


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
        let error = notifictaions.find(n => n.status == 512)
        error.description = `Table: ${tableName} is not exsist.`
        throw error
    }

}

function getCollectionsFromConfig(collectionName) {
    let mongo = config.find(db => db.database === 'mongoDB');
    let collection = mongo.collections.find(({ mongoName }) => mongoName === collectionName);
    return collection
}

function checkEntityType(entityName) {
    let table = getTableFromConfig(entityName);
    console.log({ table });
    if (table) {
        return { entityName, type: 'SQL' }
    }
    let collection = getCollectionsFromConfig(entityName);
    if (collection) {
        return { entityName, type: 'mongoDB' };
    }
    else {
        throw new Error(`the entityName : ${entityName} is not exist`);
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
                    let error = notifictaions.find(n => n.status == 513)
                    error.description = `Type: ${type} does not exist.`
                    throw error
                }
                console.log(obj[keys[i]]);
                const val = parse.parseNodeTypeToSqlType(obj[keys[i]]);
                str.push(val);
            }
            else {
                str.push('NULL')
            }
        }
        return str
    }
    catch (error) {
        if (error.status == 513) {
            throw error
        }
        throw notifictaions.find(n => n.status == 400)
    }
}

function parseSQLTypeForColumn(col, tableName) {
    const tabledata = getSqlTableColumnsType(tableName)
    let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == col.name.trim().toLowerCase()).type
    let parse
    try {
        parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    }
    catch {
        let error = notifictaions.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    const val = parse.parseNodeTypeToSqlType(col.value);
    return val
}

function buildSqlCondition(tableName, condition) {
    try {
        const tablealias = getTableFromConfig(tableName).MTDTable.name.name
        console.log({ tableName, condition })
        if (condition) {
            const entries = Object.entries(condition)
            const conditionList = entries.map(c =>
                `${tablealias}.${c[0]} =  ${parseSQLTypeForColumn({ name: c[0], value: c[1] }, tableName)}`
            )
            condition = conditionList.join(' AND ')
        }
        else {
            condition = "1 = 1"
        }
        return condition
    }
    catch (error) {
        throw error
    }
}


const readJoin = async (baseTableName, baseColumn) => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    let myTableNameSQL
    try {
        myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    }
    catch {
        let error = notifictaions.find(n => n.status == 512)
        error.description = `BaseTableName: ${baseTableName} is not exsist.`
        throw error
    }
    try {
        baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    }
    catch {
        let error = notifictaions.find(n => n.status == 514)
        error.description = `BaseColumn: ${baseColumn} is not exsist in table ${baseTableName}.`
        throw error
    }
    let selectColumns = []
    const buildJoin = (tableName, column, prevTableAlias) => {
        const connectionTable = tables.filter(({ columns }) => columns.filter(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).length != 0);
        console.log({ connectionTable });

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
                console.log({ tableJoin });
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
}

const viewConnectionsTables = (tableName, condition = {},topn) => {
    const myTable = getTableFromConfig(tableName)
    const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    let columnsSelect = [{ tableName: myTable.MTDTable.name.name, columnsName: [...myTable.columns.map(({ sqlName }) => sqlName)] }];
    let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
    columns.forEach(column => {
        const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
        const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
        console.log("viewConnectionsTables:2", tableToJoin)
        const thisTable = getTableFromConfig(tableToJoin);
        const alias = thisTable.MTDTable.name.name;
        columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
        join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    });
    if (Object.keys(condition).length > 0) {

        let conditionString = buildSqlCondition(tableName, condition)

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

function readRelatedData(tablename, id) {
    // let sql = config.find(db => db.database == 'sql')
    // let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    // let x = tables.find(table => (table.MTDTable.name.name.toLowerCase() == tablename.toLowerCase()))


}

function getReferencedColumns(tablename) {
    try {
        const table = getTableFromConfig(tablename)
        let columns = table.columns.filter(col => col.reference).map(col => ({ name: col.sqlName, ref: col.reference }))
        return columns
    } catch (error) {
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
                let error = notifictaions.find(n => n.status == 515)
                error.description = `Field: ${field} is not exsist in table: ${tablename}.`
                throw error
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
        let col = columns.find(c => c.sqlName === field)
        let parse = types[col.type.toUpperCase().replace(col.type.slice(col.type.indexOf('('), col.type.indexOf(')') + 1), '')]
        const ans = parse.parseNodeTypeToSqlType(value)
        return ans
    }
    catch (error) {
        const e = notifictaions.find(({ status }) => status === 513);
        e.description = error.message;
        throw e;
    }

}

module.exports = {
    getTableFromConfig,
    getSqlTableColumnsType, buildSqlCondition,
    parseSQLType, parseSQLTypeForColumn, readJoin, readRelatedData,
    getReferencedColumns, convertFieldType, getPrimaryKeyField, viewConnectionsTables, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn,
    checkEntityType,
    getCollectionsFromConfig
};
