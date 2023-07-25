const config = require('../config/DBconfig.json')
const notifications = require('../config/serverNotifictionsConfig.json')
const { DBType, getTableFromConfig } = require('../modules/config/config')

function parseTableName() {
    return (req, res, next) => {
        try {
            req.body.entityName = parseDBname(req.body.entityName).entityName;
            next();
        }
        catch (error) {
            console.log(error.description)
            res.status(error.status).send(error.message);

        }
    }
}

function parseColumnName(values, table) {
    table = getTableFromConfig(table)
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
        let description = `This column: ${error.join(', ')} does not exist.`
        error = notifications.find(n => n.status === 514)
        error.description = description
        throw error
    }
    return columns

}
const parseColumnNameMiddleware = () => {
    return (req, res, next) => {
        try {
            req.body.values = parseColumnName(req.body.values, req.body.entityName);
            next();
        }
        catch (error) {
            res.status(error.status).send(error.message);
        }
    }
}
const parseListOfColumnsName = () => {
    return (req, res, next) => {
        try {
            let sql = config.find(db => db.database == DBType.SQL)
            let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
            let table = tables.find(table => table.MTDTable.name.sqlName.trim() == req.body.entityName || table.MTDTable.name.sqlName == req.body.entityName)
            if (table) {
                req.body.values = req.body.values.map(obj => parseColumnName(obj, req.body.entityName))
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

const parseDBname = (entityName) => {
    console.log({entityName});
    let sql = config.find(db => db.database === DBType.SQL);
    let tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
    let table = tables.find(table => table.MTDTable.name.name == entityName || table.MTDTable.name.sqlName == entityName);
    if (table) {
        return { type: DBType.SQL, entityName: table.MTDTable.name.sqlName }
    }
    const mongo = config.find(db => db.database === DBType.MONGO);
    const collection = mongo.collections.find(({ name }) => name === entityName);
    if (collection) {
        return { type: DBType.MONGO, entityName: collection.mongoName };
    }
    else {
        let description = `The entity name ${entityName} does not exist`
        let error = notifications.find(n => n.status === 516)
        error.description = description
        throw error;
    }
}

module.exports = { parseTableName, parseColumnName, parseDBname, parseListOfColumnsName, parseColumnNameMiddleware }
