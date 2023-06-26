const config = require('../config.json')

function parseTableName() {
    return (req, res, next) => {
        console.log({ body: req.body })
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let table = tables.find(table => table.MTDTable.name.sqlName == req.body.tableName || table.MTDTable.name.sqlName == req.body.tableName)
        if (table) {
            req.body.tableName = table.MTDTable.name.sqlName
            next()
        }
        else {
            res.status(404).send('This table does not exsist.')
        }
    }
}

function parseColumnName() {
    return (req, res, next) => {
        console.log({ body: req.body })
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let table = tables.find(table => table.MTDTable.name.sqlName.trim() == req.body.tableName || table.MTDTable.name.sqlName == req.body.tableName)
        console.log(table.columns.map(c=>({name:c.name, sql:c.sqlName})))
        let columns = {}
        let error = null
        for (let name of Object.keys(req.body.values)) {
            let column = table.columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() || column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
            if (column) {
                columns[column.sqlName.toLowerCase()] = req.body.values[name.toLowerCase()]
            }
            else {
                console.log({name})
                error =name
                // res.status(404).send(`This column: ${name} does not exsist.`)
            }
        }
        // req.body.columns = columns
        console.log(req.body)
        if (error)
            res.status(404).send(`This column: ${error} does not exsist.`)
        else
            next()
    }
}

module.exports = { parseTableName, parseColumnName }
