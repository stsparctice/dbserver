const config = require('../config.json');
const fs = require('fs');

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
        fs.writeFileSync('config.json', JSON.stringify(config));
    }
};

module.exports = { updateConfig };
