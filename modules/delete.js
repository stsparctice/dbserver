// const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const config = require('../config.json');
const fs = require('fs');
const { drop,updateColumn } = require('../services/sql/sql-operations');
const { table } = require('console');

// const mongoCollection = MongoDBOperations;

async function delTableConfig(name) {
    console.log(name);
    let Tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Tables').list
    for (let index = 0; index < Tables.length; index++) {
            for (let i = 0; i <= (Tables[index].columns.length)-1; i++) {                    
                if (Tables[index].columns[i].type.includes('REFERENCES')){
                    if(Tables[index].columns[i].type.slice(Tables[index].columns[i].type.indexOf('tbl_'),-5)==`tbl_${name.tableDel}`){
                        console.log('wwwwwwwwowwwwww');
                        let obj={table:Tables[index].MTDTable.name.name,column:Tables[index].columns[i].name}
                        console.log(obj);
                        updateColumn(obj)

                    }
                
                }
               
        }
    }
    // drop(name.tableDel)
    //delete from config----
    for (let index = 0; index < Tables.length; index++) {
        if (Tables[index].MTDTable.name.name == Object.values(name)) {
            i = index
        }
    }
    Tables = (Tables.slice(0, i)).concat(Tables.slice(i + 1))
    config.map(db => {
        if (db.database == 'sql') {
            db.dbobjects.map(t => {
                if (t.type == 'Tables') {
                    t.list = Tables
                }
            })
        }
    })
    // fs.writeFileSync('config.json', JSON.stringify(config));

}

module.exports = { delTableConfig };
