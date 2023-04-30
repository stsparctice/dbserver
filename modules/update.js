const { update, create } = require('../services/sql/sql-operations');

async function updateMod(obj) {
    const result = await update(obj);
    return result;
};

async function createMod(obj) {
    const result = await create(obj);
    return result;
};

module.exports = { updateMod, createMod };
