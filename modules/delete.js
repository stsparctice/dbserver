// const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const config = require('../config/DBconfig.json');
const fs = require('fs');
const { drop, updateColumn, readAll, read, sqlTransaction } = require('../services/sql/sql-operations');
const { table } = require('console');
const { getConnectedEntities } = require('./config/config-sql');
const { updateOneSql } = require('./update');
const { updateQuery, buildReadQuey } = require('../services/sql/sql-queries');

// const mongoCollection = MongoDBOperations;

async function delTableConfig(name) {
    console.log(name);
    let Tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Tables').list
    for (let index = 0; index < Tables.length; index++) {
        for (let i = 0; i <= (Tables[index].columns.length) - 1; i++) {
            if (Tables[index].columns[i].type.includes('REFERENCES')) {
                if (Tables[index].columns[i].type.slice(Tables[index].columns[i].type.indexOf('tbl_'), -5) == `tbl_${name.tableDel}`) {
                    let obj = { table: Tables[index].MTDTable.name.name, column: Tables[index].columns[i].name }
                    console.log(obj);
                    updateColumn(obj)

                }

            }

        }
    }
    for (let index = 0; index < Tables.length; index++) {
        if (Tables[index].MTDTable.name.name == Object.values(name)) {
            i = index
        }
    }
    Tables = (Tables.slice(0, i)).concat(Tables.slice(i + 1))
    config.map(db => {
        if (db.database == 'sql') {
            db.dbobjects.map(t => {
                if (t.type == 'Tables') {
                    t.list = Tables
                }
            })
        }
    })
    // fs.writeFileSync('config.json', JSON.stringify(config));

}

async function deleteSql(obj) {
    try {
        console.log({ delete: obj })
        const connectedEntities = getConnectedEntities(obj.tableName)
        if (connectedEntities.length > 0) {
            const connectedProps = connectedEntities.map(({ MTDTable, columns }) => ({ tablename: MTDTable.name.sqlName, columns: columns.filter(({ foreignkey }) => foreignkey && foreignkey.ref_table === obj.tableName).map(({ sqlName, foreignkey }) => ({ sqlName, ref_column: foreignkey.ref_column })) }))
            const myReadQuery = buildReadQuey({ tableName: obj.tableName, condition: obj.condition })
            const mainObject = await read(myReadQuery)
            let queryItems = connectedProps.map(({ tablename, columns }) => columns.map(({ sqlName, ref_column }) => ({ tableName: tablename, sqlValues: obj.sqlValues, condition: Object.fromEntries([[sqlName, mainObject[0][ref_column]]]) })))
            queryItems = queryItems.reduce((all, item) => all = [...all, ...item], [])
            const readQueryItems = queryItems.map(({ tableName, condition }, index) => ({ index, query: buildReadQuey({ tableName, condition }) }))
            const disableIndexes = await Promise.all(readQueryItems.map(async rqi => {
                const result = await read(rqi.query)
                if (result.length>0) {
                    return rqi.index
                }
                else {
                    return -1
                }
            }))
            
            let updateQueries = queryItems.map((q, i) => disableIndexes.includes(i)? updateQuery(q):'')
            updateQueries.push(updateQuery(obj))
            updateQueries = updateQueries.filter(q=>q!=='');
            const response = await sqlTransaction(updateQueries)
            console.log({ response })
            return response
        }
        else {

            const result = await updateOneSql(obj);
            return result;
        }

    }
    catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = { delTableConfig, deleteSql };
