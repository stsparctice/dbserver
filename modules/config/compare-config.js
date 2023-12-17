const { SQL_DBNAME } = process.env;
const { buildColumnType, addColumn } = require('../../services/sql/sql-crud-db');
const { getTableKeys, getForeignKeysData, sqlKeyTypes, getSqlColumns, getIdentityColumns } = require('../../services/sql/sql-operations');

async function checkDataBase(dbName, table, db) {
    // const tablename = table.MTDTable.name.sqlName
    //     const sqlConfigColumns = await buildSqlColumnsToCompare(dbName, tablename)
    //     const {  columns } = table
    //     const newColumns = columns.filter(({ sqlName }) => sqlConfigColumns.find(col => col.sqlName === sqlName) === undefined)
    //     const removeColumns = sqlConfigColumns.filter(({sqlName})=>columns.find(col=>col.sqlName===sqlName)===undefined)
    //     console.log({newColumns})
    //     console.log({removeColumns})
        // if (newColumns.length > 0) {
        //     console.log(sqlConfigColumns.map(({ sqlName }) => sqlName), columns.map(({ sqlName }) => sqlName), newColumns)
        //     const response = await Promise.all(newColumns.map(async col => {
        //         const response = await addColumn(dbName, table, col)
        //         return response
        //     }))
        //     console.log({ response })
        // }
}

async function buildSqlColumnsToCompare(dbName, tablename) {
    const sqlColumns = await getSqlColumns(dbName, tablename)
    const sqlUniqueKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.UNIQUE)
    const sqlPrimaryKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.PRIMARY_KEY)
    const sqlForeignKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.FOREIGN_KEY)
    const sqlIdentityColumns = await getIdentityColumns(dbName, tablename)
    let sqlConfigColumns = sqlColumns.map(col => convertSqlToConfig(col))

    if (sqlPrimaryKeys.length > 0) {
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const primarykey = sqlPrimaryKeys.find(pk => pk.name === col.sqlName)
            if (primarykey) {
                col.primarykey = true
            }
            return col
        })
    }

    if (sqlUniqueKeys.length > 0) {
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const uniquekey = sqlUniqueKeys.find(uk => uk.name === col.sqlName)
            if (uniquekey) {
                col.uniquekey = true
            }
            return col
        })
    }

    if (sqlIdentityColumns.length > 0) {
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const isIdentity = sqlIdentityColumns.find(id => id.name === col.sqlName)
            if (isIdentity) {
                col.isIdentity = true
            }
            return col
        })
    }
    if (sqlForeignKeys.length > 0) {
        const foreignkeys = await getForeignKeysData(dbName, tablename)
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const foreignkey = foreignkeys.find(fk => fk.column === col.sqlName)
            if (foreignkey) {
                const { column, ...rest } = foreignkey
                col.foreignkey = rest
            }
            return col
        })
    }

    return sqlConfigColumns
}


function convertSqlToConfig({ name, type, max, isnull }) {
    const convertColumn = { sqlName: name, type: { type: type.toUpperCase() } }
    if (max) {
        if (max === -1) {
            max = 'MAX'
        }
        convertColumn.type.max = max
    }
    if (isnull === 'NO') {
        convertColumn.type.isnull = false
    }
    else {
        convertColumn.type.isnull = true
    }
    return convertColumn

}


module.exports = { checkDataBase }


