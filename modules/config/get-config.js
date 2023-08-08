require('dotenv');
const { SQL_DBNAME } = process.env;
const{DBType} = require('../../utils/types')
const DBconfig = require('../../config/DBconfig.json');
const notifictaions = require('../../config/serverNotifictionsConfig.json');



function getTableFromConfig(tableName, config = DBconfig) {
    try {
        if (typeof tableName !== 'string') {
            let error = notifictaions.find(({ status }) => status === 519);
            error.description += 'The table name should be of type string';
            throw error;
        }
        let tables;
        try {
            let sql = config.find(db => db.database === 'sql');
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

function getCollectionsFromConfig(collectionName, config = DBconfig) {
    try {
        if (typeof collectionName !== 'string') {
            let error = notifictaions.find(({ status }) => status === 519);
            error.description += 'The collection name should be of type string';
            throw error;
        }
        let collection;
        try {
            let mongo = config.find(db => db.database === 'mongoDB');
            collection = mongo.collections.find(({ mongoName }) => mongoName === collectionName);
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 600);
            error.description += '(check the config file).';
            throw error;
        }
        if (!collection) {
            let error = notifictaions.find(n => n.status === 517);
            error.description = `Collection: ${collectionName} does not exsist.`;
            throw error;
        }
        return collection;
    }
    catch (error) {
        throw error;
    }
}

function getReferencedColumns(tablename, config = DBconfig) {
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

function getForeignTableAndColumn(tablename, field, config = DBconfig) {
    try {
        const table = getTableFromConfig(tablename, config);
        if (typeof field !== 'string') {
            let error = notifictaions.find(({ status }) => status === 519);
            error.description += 'The table name should be of type string';
            throw error;
        }
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
            error.description = `Field: ${field} is not exsist in table: ${tablename}.`;
            throw error;
        }
        const foreignTable = getTableFromConfig(foreignTableName.toLowerCase(), config);
        const { defaultColumn } = foreignTable.MTDTable;
        console.log({ foreignTableName, defaultColumn });
        return { foreignTableName, defaultColumn };
    }
    catch (error) {
        throw error;
    }
}

function getTabeColumnName(tablename, config = DBconfig) {
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

// ------------------------------------------------------------------------------------------------------------------------------

const readJoin = async (baseTableName, baseColumn, config = DBconfig) => {
    const tables = config.find(f => f.database === "sql").dbobjects.find(({ type }) => type === "Tables").list
    let myTableNameSQL
    try {
        myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    }
    catch {
        let error = notifictaions.find(n => n.status === 512)
        error.description = `BaseTableName: ${baseTableName} does not exsist.`
        throw error
    }
    try {
        baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    }
    catch {
        let error = notifictaions.find(n => n.status === 514)
        error.description = `BaseColumn: ${baseColumn} does not exsist in table ${baseTableName}.`
        throw error
    }
    let selectColumns = []
    const buildJoin = (tableName, column, prevTableAlias, config = DBconfig) => {
        const connectionTable = tables.filter(({ columns }) => columns.filter(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).length != 0);

        let join = '';
        if (tableName === myTableNameSQL) {
            let alias1 = tables.find(({ MTDTable }) => MTDTable.name.sqlName === tableName).MTDTable.name.name;
            join = `FROM ${tableName} ${alias1} `
            prevTableAlias = alias1;

            let columns = tables.find(({ MTDTable }) => MTDTable.name.sqlName === tableName).columns.map(({ sqlName }) => { return sqlName });
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
                    join = `${join} ${buildJoin(tableJoin, columnToJoin, alias, config = config)}`
                }
                else {
                    join = `${join} LEFT JOIN ${tableJoin} ${alias} ON ${alias}.${columnToEqual}=${prevTableAlias}.${column} ${buildJoin(tableJoin, columnToJoin, alias, config = config)}`
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
function setFullObj(parentTable, refTable, config = DBconfig) {
    // let table = getTableFromConfig(parentTable)
    // const f = `select ${refTable.ref} from ${parentTable}`
    // let table2 = getTableFromConfig(refTable,config)
    // table2 = table2.columns.map(col => { col.name })
    // table.columns.filter(col => {
    //     if (col.sqlName === refTable.name) {
    //         col = table2
    //     }
    // }).map()
    // let columns = table.columns.filter(col => col.sqlName === b.ref).map()
}
// function getTables(tablename,config=DBconfig) {
//     const table = getTableFromConfig(tablename,config)
//     return table
// }
// 
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

function getObjectWithFeildNameForPrimaryKey(tablename, fields, id, config = DBconfig) {
    try {

        let primarykey = getPrimaryKeyField(tablename, config)
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
function convertFieldType(tablename, field, value, config = DBconfig) {
    try {

        const columns = getSqlTableColumnsType(tablename, config)
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
    getTabeColumnName,
    getReferencedColumns,
    getTableAccordingToRef,
    setFullObj,
    convertFieldType,
    getTableFromConfig,
    readJoin,
    getReferencedColumns,
    convertFieldType, getObjectWithFeildNameForPrimaryKey,
    getForeignTableAndColumn,
    getCollectionsFromConfig,
    DBType,
};
