const config = require('../../config.json')
const types = require('./config-objects')
require('dotenv');
const { SQL_DBNAME } = process.env;

function getSqlTableColumnsType(tablename) {
    let sql = config.find(db => db.database == 'sql')
    let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
    let x = tables.find(table => table.MTDTable.name.sqlName == tablename)
    let col = x.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
    return col
};

function parseSQLType(obj, tabledata) {
    const keys = Object.keys(obj)
    // console.log({ keys });
    let str = []
    for (let i = 0; i < keys.length; i++) {
        //לבדוק מקרים שמכניסים null
        if (obj[keys[i]]) {
            let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
            let parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
            str.push(parse.parseNodeTypeToSqlType(obj[keys[i]]))

            // console.log(types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]);
            // if (type.toLowerCase().includes('nvarchar') || type.toLowerCase().includes('date') || type.toLowerCase().includes('bit')) {
            //     str.push(`'${obj[keys[i]]}'`)
            // }
            // else {
            //     str.push(obj[keys[i]])
            // }
        }
        else {
            str.push('NULL')
        }
    }
    return str
}

// function parseTableName(tablename) {
//     let sql = config.find(db => db.database == 'sql')
//     let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
//     let table = tables.find(table => table.name.name == tablename)
//     if (table) {
//         return table.name.sqlName
//     }
//     else {
//         throw new Error('This table is not exsist.')
//     }
// }


// function parseColumnName(columnname, tablename) {
//     let sql = config.find(db => db.database == 'sql')
//     let tables = sql.dbobjects.find(obj => obj.type == 'Tables').list
//     let table = tables.find(table => table.name.sqlName == tablename)
//     let column = table.columns.find(column => column.name == columnname)
//     if (column) {
//         return column.sqlName
//     }
//     else {
//         throw new Error('This column is not exsist.')
//     }
// }



//         let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type;
//         if (obj[keys[i]]) {
//             if (type.toLowerCase().includes('nvarchar')) {

//                 str.push(`N'${obj[keys[i]]}'`);
//             }
//             else {
//                 if (type.toLowerCase().includes('date') && obj[keys[i]] || type.toLowerCase().includes('bit')) {
//                     str.push(`'${obj[keys[i]]}'`);

//                 }
//                 else {
//                     str.push(obj[keys[i]]);
//                 }
//             }
//         }
//         else {
//             str.push(`NULL`);
//         }
//     }

//     return str;
// };

const readJoin = async (baseTableName, baseColumn) => {
    const tables = config.find(f => f.database == "sql").dbobjects.find(({ type }) => type === "Tables").list
    const myTableNameSQL = tables.find(({ MTDTable }) => MTDTable.name.name === baseTableName).MTDTable.name.sqlName;
    baseColumn = tables.find(({ MTDTable }) => MTDTable.name.sqlName === myTableNameSQL).columns.find(({ name }) => name === baseColumn).sqlName;
    let selectColumns = []
    const buildJoin = (tableName, column, prevTableAlias) => {
        const connectionTable = tables.filter(({ columns }) => columns.filter(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).length != 0);
        let join = '';
        if (tableName === myTableNameSQL) {
            let alias1 = tables.find(({ MTDTable }) => MTDTable.name.sqlName == tableName).MTDTable.name.name;
            join = `FROM ${tableName} ${alias1} `
            prevTableAlias = alias1;
            let columns = tables.find(({ MTDTable }) => MTDTable.name.sqlName == tableName).columns.map(({ sqlName }) => { return sqlName });
            selectColumns.push({ alias: prevTableAlias, columns });
        }
        if (connectionTable.length > 0)
            for (let table of connectionTable) {
                let tableJoin = table.MTDTable.name.sqlName;
                let alias = table.MTDTable.name.name;
                let columns = table.columns.map(({ name }) => { return name });
                selectColumns.push({ alias, columns })
                let columnToEqual = [table].map(({ columns }) => columns.find(({ type }) => type.includes(`REFERENCES ${tableName}(${column})`)).sqlName)[0];
                let columnToJoin = [table].map(({ columns }) => columns.find(({ type }) => type.includes('PRIMARY KEY')).sqlName)[0];
                join = `${join} JOIN ${tableJoin} ${alias} ON ${alias}.${columnToEqual}=${prevTableAlias}.${column} ${buildJoin(tableJoin, columnToJoin, alias)}`
            }
        else {
            join = ``;
        }
        return join;
    }
    let result = buildJoin(myTableNameSQL, baseColumn);
    let select = "";
    selectColumns.forEach(s => {
        s.columns.forEach(c => {
            select = `${select} ${s.alias}.${c} as ${s.alias}_${c},`;
        });
    });
    result = `USE ${SQL_DBNAME} SELECT ${select.slice(0, select.length - 1)} ${result}`;
    console.log(result);
    return result;
};

module.exports = { getSqlTableColumnsType, parseSQLType, readJoin };
