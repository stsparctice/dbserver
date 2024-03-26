const notifications = require('../config/serverNotifictionsConfig.json')
const { getDBTypeAndName, parseColumnName } = require('../modules/config/get-config')
const { DBType } = require('./types');

function parseTableName() {
    return (req, res, next) => {
        try {
            req.body.entityName = req.params.entityname;
            const dbTypes = getDBTypeAndName(req.params.entityname);
            const sqlType = dbTypes.find(({ type }) => type === DBType.SQL)
            const mongoType = dbTypes.find(({ type }) => type === DBType.MONGO)
            if (mongoType)
                req.body.mongoEntityName = mongoType.entityName;
            if (sqlType) {
                req.body.sqlEntityName = sqlType.entityName
            }
            next();
        }
        catch (error) {
            console.log(error.description)
            res.status(500).send(error.message);

        }
    }
}


const parseColumnNameMiddleware = () => {
    return (req, res, next) => {
        try {
            const { sqlValues, noSqlValues, connectedEntities } = parseColumnName(req.body.data, req.params.entityname);
            req.body.sqlValues = sqlValues
            req.body.connectedEntities = connectedEntities
            if (req.body.mongoEntityName) {
                req.body.mongoValues = noSqlValues
            }
            //     else{

            //         let description = `The column${error.length > 1 ? 's' : ''}: ${error.join(', ')} ${error.length > 1 ? 'do' : 'does'} not exist.`
            // //     error = notifications.find(n => n.status === 514)
            // //     error.description = description
            // //     throw error
            // }
            next();
        }
        catch (error) {
            console.log({ error })
            res.status(500).send(error.message);
        }
    }
}
const parseListOfColumnsName = () => {
    return (req, res, next) => {
        try {
            let sql = config.find(db => db.database == DBType.SQL)
            let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
            let table = tables.find(table => table.MTDTable.name.sqlName.trim() == req.params.entityname || table.MTDTable.name.sqlName == req.params.entityname)
            if (table) {
                req.body.data = req.body.data.map(obj => parseColumnName(obj, req.params.entityname).sqlValues)
                next()
            }
            else {
                throw notifications.find(n => n.status === 409)
            }
        }
        catch (error) {
            res.status(500).send(error.message)
        }

    }
}



module.exports = {
    parseTableName,
    parseListOfColumnsName,
    parseColumnNameMiddleware
}
