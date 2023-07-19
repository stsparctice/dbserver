const config = require('../../config/DBconfig.json')
require('dotenv');
const { SQL_DBNAME } = process.env;
const notifictaions = require('../../config/serverNotifictionsConfig.json');
// const { convertToSqlCondition } = require('../../utils/convert_condition');


function getTableFromConfig(tableName) {
    try {
        console.log({ tableName });
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

function readRelatedData(tablename, id) {
    // let sql = config.find(db => db.database == 'sql')
    // let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    // let x = tables.find(table => (table.MTDTable.name.name.toLowerCase() == tablename.toLowerCase()))


}

module.exports = {
    getTableFromConfig,
    readJoin, readRelatedData,
    getCollectionsFromConfig
};
