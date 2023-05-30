const { create } = require('../services/sql/sql-operations');

async function createMod(obj) {
    console.log("obj "+obj);
    const result = await create(obj);
    console.log("result: "+result);

    return result;
};

module.exports = {
    createMod
};
