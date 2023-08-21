const config = require('../../config/DBconfig.json');
const fs = require('fs');

async function createTableInConfig(object) {
    let n = config
    let i = n.find(m => {
        if (m.database.includes('sql')) {
            m.dbobjects[1].list.push(object)
        }
    })
    fs.writeFileSync('config/DBconfig.json', JSON.stringify(n))

};

module.exports = {createTableInConfig};
