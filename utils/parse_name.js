const config = require('../config/DBconfig.json')

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
        let sql = config.find(db => db.database == 'sql')
        let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
        let table = tables.find(table => table.MTDTable.name.sqlName.trim() == req.body.tableName || table.MTDTable.name.sqlName == req.body.tableName)
        // console.log(table.columns.map(c => ({ name: c.name, sql: c.sqlName })))
        let columns = {}
        let error = undefined
        for (let name of Object.keys(req.body.values)) {
            let column = table.columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() || column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
            if (column) {
                columns[column.sqlName] = req.body.values[name]
            }
            else {
                error = name
            }
        }
        req.body.values = columns
        if (error)
            res.status(404).send(`This column: ${error} does not exsist.`)
        else
            next()
    }
}
const parseTBname = (tbname) => {
    let sql = config.find(db => db.database == 'sql');
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list;
    let table = tables.find(table => table.MTDTable.name.name == tbname || table.MTDTable.name.sqlName == tbname);
    if (table) {
        return table.MTDTable.name.sqlName;
    }
    else {
        throw new Error(`the entity name ${tbname} not exist`);
    }
}

module.exports = { parseTableName, parseColumnName, parseTBname }
