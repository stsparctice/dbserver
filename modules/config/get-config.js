require('dotenv');
const { SQL_DBNAME } = process.env;
const { DBType } = require('../../utils/types')
const DBconfig = require('../../config/DBconfig.json');
const notifictaions = require('../../config/serverNotifictionsConfig.json');

const getDBTypeAndName = (entityName, config = DBconfig) => {
    const sql = config.find(db => db.database === DBType.SQL);
    const tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
    const table = tables.find(table => table.MTDTable.name.name == entityName || table.MTDTable.name.sqlName == entityName);
    if (table) {
        return { type: DBType.SQL, entityName: table.MTDTable.name.sqlName }
    }
    const mongo = config.find(db => db.database === DBType.MONGO);
    const collection = mongo.collections.find(({ name }) => name === entityName);
    if (collection) {
        return { type: DBType.MONGO, entityName: collection.mongoName };
    }
    else {
        let error = notifictaions.find(n => n.status === 516)
        error.description = `The entity name ${entityName} does not exist`
        throw error;
    }
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

module.exports = {
    getDBTypeAndName,
    setFullObj,
    readJoin,
};
