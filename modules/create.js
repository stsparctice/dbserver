const { create } = require('../services/sql/sql-operations');

async function createMod(obj) {
    const result = await create(obj);
    return result;
};

module.exports = {
    createMod
};
