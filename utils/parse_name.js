const config = require('../config.json')

function parseTableName() {
    return (req, res, next) => {
        try {
            req.body.tableName = parseTBname(req.body.tableName)
            next();
        }

        catch (error) {
            res.status(500).send(error.message)

        }
    }
}

function parseColumnName() {
    return (req, res, next) => {
        console.log({ body: req.body })
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let table = tables.find(table => table.MTDTable.name.sqlName == req.body.tableName || table.MTDTable.name.sqlName == req.body.tableName)
        let columns = {}
        for (let name of Object.keys(req.body.values)) {
            let column = table.columns.find(column => column.name == name || column.sqlName == name)
            if (column) {
                columns[column.sqlName] = req.body.values[name]
            }
            else {
                res.status(404).send(`This column: ${name} does not exsist.`)
            }
        }
        req.body.values = columns
        next()
    }
}
const parseTBname = (tbname) => {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let table = tables.find(table => table.MTDTable.name.name == tbname || table.MTDTable.name.sqlName == tbname)
    if (table) {
        
        return table.MTDTable.name.sqlName
    }
    else {
        throw new Error(`the entity name ${tbname} not exist`)
    }
}

module.exports = { parseTableName, parseColumnName, parseTBname }
