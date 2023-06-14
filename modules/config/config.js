const config = require('../../configCreate.json')

function getSqlTableColumnsType(tablename) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let x = tables.find(table => table.MTDTable.name.sqlName == tablename)
    let col = x.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
    return col
}

function parseSQLType(obj, tabledata) {
    console.log({ tabledata });
    console.log({ obj });
    const keys = Object.keys(obj)
    console.log({ keys });
    let str = []
    for (let i = 0; i < keys.length; i++) {
        let type = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
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