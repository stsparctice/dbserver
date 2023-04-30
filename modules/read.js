const { read } = require('../services/sql/sql-operations')

async function getDetailsMod(obj) {
    const list = await read(obj);
    return list;
};

module.exports = { getDetailsMod };
