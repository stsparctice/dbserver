const config = require('../config.json')

const parse = {
    'INT': 'number', 'NVARCHAR': 'string'
}

function getSqlTableColumnsType(tablename) {
    let sql = config.find(o => Object.keys(o).includes('sql'))
    let tables = sql.sql.find(o => Object.keys(o).includes('Tables'))
    let x = tables.Tables.find(t => Object.values(t.MTDTable.name)[0] == tablename)
    let col = x.columns.map(c => ({ name: Object.values(c[Object.keys(c)[0]])[0], type: c[Object.keys(c.type)[0]].type.split(' ')[0] }))
    return col
}

function parseSQLType(obj, tabledata) {
    console.log({obj})
    console.log({tabledata})
    const keys = Object.keys(obj)
    let str = []
    for (let i = 0; i < keys.length; i++) {
       
        let type = tabledata.find(td => td.name.trim() == keys[i].trim()).type
     
        if (type.includes('nvarchar')) {
            str.push(`'${obj[keys[i]]}'`)
        }
        else{
            str.push(obj[keys[i]])
        }
    }
    return str
}

module.exports = { getSqlTableColumnsType, parseSQLType }