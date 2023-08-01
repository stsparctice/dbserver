const DBconfig = require('../../config/DBconfig.json')
const notifictaions = require('../../config/serverNotifictionsConfig.json');

function getTableName(config = DBconfig) {
    let tables;
    try {
        let sql = config.find(db => db.database === 'sql');
        tables = sql.dbobjects.find(obj => obj.type === 'Tables').list;
    }
    catch {
        error = notifictaions.find(({ status }) => status === 500);
        error.description += '(check the config file).';
        throw error;
    };
    let tableNameAndDescription = [];
    tables.forEach(t => {
        tableNameAndDescription.push(t.MTDTable.name.sqlName, t.MTDTable.description);
    });
    return tableNameAndDescription;
}

function getColumns(tableName, config = DBconfig) {
    try {
        let tables;
        try {
            let sql = config.find(db => db.database == 'sql');
            tables = sql.dbobjects.find(obj => obj.type == 'Tables').list;
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 500);
            error.description += '(check the config file).';
            throw error;
        }
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].MTDTable.name.sqlName == tableName) {
                return tables[i].columns
            }
        }
        let error = notifictaions.find(n => n.status == 512);
        error.description = `Table: ${tableName} does not exist.`;
        throw error;
    }
    catch (error) {
        throw error;
    }
}

async function getProcedures(config = DBconfig) {
    let procedures = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Procedures').list
    let proceduresNameAndDescription = []
    let proceduresName = [];
    let proceduresDescription = [];
    let name;
    let description;
    procedures.forEach(t => {
        name = t.MTDProcedure.name;
        proceduresName.push(name)
        description = Object.values(t.MTDProcedure.description)
        proceduresDescription.push(description)
    })
    for (let i = 0; i < proceduresDescription.length; i++) {
        proceduresNameAndDescription.push([proceduresName[i], proceduresDescription[i]])
    }
    return proceduresNameAndDescription
}

function getvalues(proceduresName, config = DBconfig) {
    try {
        let procedures;
        try {
            let sql = config.find(db => db.database == 'sql');
            procedures = sql.dbobjects.find(obj => obj.type == 'Procedures').list;
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 500);
            error.description += '(check the config file).';
            throw error;
        }
        for (let i = 0; i < procedures.length; i++) {
            if (Object.values(procedures[i].MTDProcedure.name)[0] === proceduresName) {
                return procedures[i].values
            }
        }
        let error = notifictaions.find(n => n.status == 512);
        error.description = `Procedure: ${proceduresName} does not exist.`;
        throw error;
    }
    catch (error) {
        throw error;
    }
}


module.exports = { getTableName, getColumns, getProcedures, getvalues };
