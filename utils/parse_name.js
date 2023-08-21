const notifications = require('../config/serverNotifictionsConfig.json')
const { getDBTypeAndName } = require('../modules/config/get-config')
const { getTableColumns } = require('../modules/config/config-sql')

function parseTableName() {
    return (req, res, next) => {
        try {
            req.body.entityName = getDBTypeAndName(req.body.entityName).entityName;
            next();
        }
        catch (error) {
            console.log(error.description)
            res.status(error.status).send(error.message);

        }
    }
}

function parseColumnName(values, table) {
   try{
    let columns =  getTableColumns(table)
    const answer = []
    let error = [];
    for (let name in values) {
        let column = columns.find(column => column.name.trim().toLowerCase() == name.trim().toLowerCase() ||
            column.sqlName.trim().toLowerCase() == name.trim().toLowerCase())
        //😡 לסדר בהתאם לצורה השפויה
        if (column) {
            answer[column.sqlName] = values[name]
        }
        else {
            error = [...error, name];
        }
    }
    if (error.length > 0) {
        let description = `The column${error.length > 1 ? 's' : ''}: ${error.join(', ')} ${error.length > 1 ? 'do' : 'does'} not exist.`
        error = notifications.find(n => n.status === 514)
        error.description = description
        throw error
    }
    return answer
   
}
catch(error){
    throw error
}

}
const parseColumnNameMiddleware = () => {
    return (req, res, next) => {
        try {
            req.body.values = parseColumnName(req.body.values, req.body.entityName);
            next();
        }
        catch (error) {
            console.log({ error })
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



module.exports = {
    parseTableName,
    parseColumnName,
    parseListOfColumnsName,
    parseColumnNameMiddleware
}
