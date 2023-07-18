const config = require('../config/DBconfig.json')

function parseTableName() {
    return (req, res, next) => {
        try {
            req.body.entityName = parseTBname(req.body.entityName)
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
        let error;
        if (table) {
            let columns = {}
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
        }
        if (error)
            res.status(404).send(`This column: ${error} does not exsist.`)
        else
            next()
    }
}
const parseTBname = (entityName) => {
    console.log({entityName})
    let sql = config.find(db => db.database === 'sql');
    let tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
    let table = tables.find(table => table.MTDTable.name.name.toLowerCase() == entityName.toLowerCase() || table.MTDTable.name.sqlName.toLowerCase() == entityName.toLowerCase());
    if (table) {
        return table.MTDTable.name.sqlName;
    }
    const mongo = config.find(db => db.database === 'mongoDB');
    const collection = mongo.collections.find(({ name }) => name === entityName);
    if (collection) {
        return collection.mongoName;
    }
    else {
        throw new Error(`The entity name ${entityName} does not exist`);
    }
}

module.exports = { parseTableName, parseColumnName, parseTBname }
