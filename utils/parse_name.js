const notifications = require('../config/serverNotifictionsConfig.json')
const { getDBTypeAndName } = require('../modules/config/get-config')
const { parseColumnName } = require('../modules/config/config-sql');
const { DBType } = require('./types');

function parseTableName() {
    return (req, res, next) => {
        try {
            const dbTypes = getDBTypeAndName(req.body.entityName);
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
            res.status(error.status).send(error.message);

        }
    }
}


const parseColumnNameMiddleware = () => {
    return (req, res, next) => {
        try {
            const { sqlValues, noSqlValues } = parseColumnName(req.body.values, req.body.entityName);
            req.body.sqlValues = sqlValues
           
            if (req.body.mongoEntityName){
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
                req.body.values = req.body.values.map(obj => parseColumnName(obj, req.body.entityName).sqlValues)
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
    parseListOfColumnsName,
    parseColumnNameMiddleware
}
