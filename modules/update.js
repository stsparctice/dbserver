const { update, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function updateSql(obj) {
    const result = await update(obj);
    return result;
};

async function updateMng(obj) {
    console.log('updatemngggggggggggg');
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.updateOne(obj);
    console.log('r22222222222222',response);
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

async function dropCollectionMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.dropCollection(obj);
    return response;
};


module.exports = { updateSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng ,dropCollectionMng};
