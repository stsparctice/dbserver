const config = require('../config/DBconfig.json');
const fs = require('fs');

async function updateConfigInFiled(tableName, columnObj) {
    let n = config
    n.find(m => {
        if (m.database.includes('sql')) {
            const index = m.dbobjects[1].list.findIndex(item => item.MTDTable.name.name == tableName)
            m.dbobjects[1].list[index].columns.push(columnObj)
            fs.writeFileSync('config2.json', JSON.stringify(n));
        }
    })
}


async function updateConfig2(object) {
    let n = config
    let i = n.find(m => {
        if (m.database.includes('sql')) {
            m.dbobjects[1].list.push(object)
        }
    })

    // fs.writeFileSync('configCreate.json', JSON.stringify(n))
    fs.writeFileSync('config.json', JSON.stringify(n))

};




async function updateConfig(object) {
    if (object.db === 'sql') {
        let db = config.find(db => db[object.db] !== undefined)
        let o = db[object.db].find(m => m[object.pt] !== undefined)
        let newObj = {};
        for (let t in o[object.pt]) {
            if (Object.values((o[object.pt][t][(Object.keys(o[object.pt][t])[0])]['name'])).includes(object.table)) {
                if (o[object.pt][t][object.mcv].length === undefined) {
                    if (Object.values(o[object.pt][t][object.mcv]['name']).includes(object.vncn)) {
                        newObj[object.ntd] = object.to;
                        o[object.pt][t][object.mcv][object.ntd] = newObj;
                        break;
                    };
                }
                else {
                    for (let x in o[object.pt][t][object.mcv]) {
                        if (Object.values(o[object.pt][t][object.mcv][x]['name']).includes(object.vncn)) {
                            newObj[object.ntd] = object.to;
                            o[object.pt][t][object.mcv][x][object.ntd] = newObj;
                            break;
                        };
                    };
                };
            };
        };
        // fs.writeFileSync('configCreate.json', JSON.stringify(config));
        fs.writeFileSync('config.json', JSON.stringify(config));

    }
};

module.exports = { updateConfig ,updateConfigInFiled,updateConfig2};
