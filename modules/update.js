const { update, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function updateSql(obj) {
    const result = await update(obj);
    return result;
};

async function updateMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.updateOne(obj);
    return response;
};

async function updateQuotationSql(obj) {
    const result = await updateQuotation(obj);
    return result;
};

async function updateSuppliersBranchesSql(obj) {
    const result = await updateSuppliersBranches(obj);
    return result;
};

module.exports = { updateSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng };
