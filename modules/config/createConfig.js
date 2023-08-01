const DBconfig = require('../../config/DBconfig.json')
const notifictaions = require('../../config/serverNotifictionsConfig.json');

function getTableName(config = DBconfig) {
    try {
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
            tableNameAndDescription.push([t.MTDTable.name.sqlName, t.MTDTable.description]);
        });
        return tableNameAndDescription;
    }
    catch (error) {
        throw error;
    }
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

function getProcedures(config = DBconfig) {
    try {
        let procedures;
        try {
            let sql = config.find(db => db.database === 'sql');
            procedures = sql.dbobjects.find(obj => obj.type === 'Procedures').list;
        }
        catch {
            error = notifictaions.find(({ status }) => status === 500);
            error.description += '(check the config file).';
            throw error;
        };
        let proceduresNameAndDescription = [];
        procedures.forEach(t => {
            proceduresNameAndDescription.push([Object.values(t.MTDProcedure.name)[0], t.MTDProcedure.description.description]);
        });
        return proceduresNameAndDescription;
    }
    catch (error) {
        throw error;
    }
}

function getvalues(proceduresName, config = DBconfig) {
    let procedures = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Procedures').list
    for (let i = 0; i < procedures.length; i++) {
        if (Object.keys(procedures[i].MTDProcedure.name)[0] == Object.keys(proceduresName[0])[0]) {
            return procedures[i].values
        }
    }
}


module.exports = { getTableName, getColumns, getProcedures, getvalues };
