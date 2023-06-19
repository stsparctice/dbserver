const config = require('../../config.json')
const types = require('./config-objects')

function getSqlTableColumnsType(tablename) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let x = tables.find(table => table.MTDTable.name.sqlName == tablename)
    let col = x.columns.map(col => ({ name: col.sqlName, type: col.type.trim().split(' ')[0] }))
    return col
}

function parseSQLType(obj, tabledata) {
    const keys = Object.keys(obj)
    let str = []
    for (let i = 0; i < keys.length; i++) {
        // console.log({ tabledata });
        let type = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
        let parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
        str.push(parse.parseNodeTypeToSqlType(obj[keys[i]]))

        // console.log(types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]);
        // if (type.toLowerCase().includes('nvarchar') || type.toLowerCase().includes('date') || type.toLowerCase().includes('bit')) {
        //     str.push(`'${obj[keys[i]]}'`)
        // }
        // else {
        //     str.push(obj[keys[i]])
        // }
    }
    return str
}

// function parseTableName(tablename) {
//     let sql = config.find(db => db.database == 'sql')
//     let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
//     let table = tables.find(table => table.name.name == tablename)
//     if (table) {
//         return table.name.sqlName
//     }
//     else {
//         throw new Error('This table is not exsist.')
//     }
// }

function parseTableName(req, res, next) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let table = tables.find(table => table.name.name == req.body.tablename)
    if (table) {
        req.body.tablename = table
        next()
    }
    else {
        res.status(404).send('This table is not exsist.')
    }
}

// function parseColumnName(columnname, tablename) {
//     let sql = config.find(db => db.database == 'sql')
//     let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
//     let table = tables.find(table => table.name.sqlName == tablename)
//     let column = table.columns.find(column => column.name == columnname)
//     if (column) {
//         return column.sqlName
//     }
//     else {
//         throw new Error('This column is not exsist.')
//     }
// }

function parseColumnName(req, res, next) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let table = tables.find(table => table.name.sqlName == tablename)
    let columns = {}
    for (let name of Object.keys(req.body.values)) {
        let column = table.columns.find(column => column.name == name)
        if (column) {
            columns[column.sqlName] = req.body.values[name]
        }
        else {
            res.status(404).send(`This column: ${name} is not exsist.`)
        }
    }
    req.body.values = columns
    next()
}

module.exports = { getSqlTableColumnsType, parseSQLType, parseTableName, parseColumnName }