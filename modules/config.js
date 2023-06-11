const config = require('../config.json')



function getSqlTableColumnsType(tablename) {
    let sql = config.find(o => Object.keys(o).includes('sql'))
    let tables = sql.sql.find(o => Object.keys(o).includes('Tables'))
    let x = tables.Tables.find(t => Object.values(t.MTDTable.name)[0] == tablename)
    let col = x.columns.map(c => ({ name: Object.values(c[Object.keys(c)[0]])[0], type: c[Object.keys(c.type)[0]].type.trim().split(' ')[0] }))
    return col
}

function parseSQLType(obj, tabledata) {
    console.log(tabledata)
    console.log(obj)
    const keys = Object.keys(obj)
    let str = []
    for (let i = 0; i < keys.length; i++) {
        let type = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase()).type

        if (type.toLowerCase().includes('nvarchar') ) {
            str.push(`N'${obj[keys[i]]}'`)
        }

        else {

            if (type.toLowerCase().includes('date') || type.toLowerCase().includes('bit'))
                str.push(`'${obj[keys[i]]}'`)
            else
                str.push(obj[keys[i]])
        }
    }
    return str
}

module.exports = { getSqlTableColumnsType, parseSQLType }