const config = require('../../config.json')

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
        let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type

        if (type.toLowerCase().includes('nvarchar') || type.toLowerCase().includes('date') || type.toLowerCase().includes('bit')) {
            str.push(`'${obj[keys[i]]}'`)
        }
        else {
            str.push(obj[keys[i]])
        }
    }
    return str
}

module.exports = { getSqlTableColumnsType, parseSQLType }