const config = require('../config/DBconfig.json')
const notifications = require('../config/serverNotifictionsConfig.json')

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

function parseColumnName(values, table) {

    let columns = {}
    let error = [];
    for (let name in values) {
        let column = table.columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() || column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
        //😡 לסדר בהתאם לצורה השפויה
        if (column) {
            columns[column.sqlName] = values[name]
        }
        else {
            error = [...error, name];
        }
    }
    if (error.length > 0) {
        let description = `This column: ${error.join(', ')} does not exsist.`
        error = notifications.find(n => n.status === 514)
        error.description = description
        throw error
    }
    return columns

}
const parseColumnNameMiddleware = () => {
    return (req, res, next) => {
        try {
            const table = getTableFromConfig(req.body.entityName)
            if (table) {
                req.body.values = parseColumnName(req, body.values, table);
                next();
            }
            else {
                const error = notifications.find(({ status }) => status === 513);
                res.status(error.status).send(error.message);
            }
        }
        catch (error) {
            res.status(error.status).send(error.message);
        }
    }
}
const parseListOfColumnsName = () => {
    return (req, res, next) => {
        try {
            let sql = config.find(db => db.database == 'sql')
            let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
            let table = tables.find(table => table.MTDTable.name.sqlName.trim() == req.body.entityName || table.MTDTable.name.sqlName == req.body.entityName)
            if (table) {
                req.body.values = req.body.values.map(obj => parseColumnName(obj, table))
                next()
            }
            else {
                throw notifications.find(n => n.status === 409)
            }
        }
        catch (error) {
            res.status(error.status).send(error.message)
        }

    }
}

const parseTBname = (entityName) => {
    let sql = config.find(db => db.database == 'sql');
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list;
    let table = tables.find(table => table.MTDTable.name.name == entityName || table.MTDTable.name.sqlName == entityName);
    if (table) {
        return table.MTDTable.name.sqlName;
    }
    const mongo = config.find(db => db.database === 'mongoDB');
    const collection = mongo.collections.find(({ name }) => name === entityName);
    if (collection) {
        return collection.mongoName;
    }
    else {
        throw new Error(`The entity name ${entityName} not exist`);
    }
}

module.exports = { parseTableName, parseColumnName, parseTBname, parseListOfColumnsName ,parseColumnNameMiddleware}
