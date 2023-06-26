const { update, updateQuotation, updateSuppliersBranches } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

async function updateSql(obj) {
    try {
        const result = await update(obj);
        return result;
    }
    catch {
        throw new Error('Update faild.')
    }
};

async function updateMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.updateOne(obj);
        return response;
    }
    catch {
        throw new Error('Update falid.')
    }
};

async function updateQuotationSql(obj) {
    try {
        const result = await updateQuotation(obj);
        return result;
    }
    catch {
        throw new Error('Update faild.')
    }
};

async function updateSuppliersBranchesSql(obj) {
    try {
        const result = await updateSuppliersBranches(obj);
        return result;
    }
    catch {
        throw new Error('Update faild.')
    }
};

async function dropCollectionMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.dropCollection(obj);
        return response;
    }
    catch {
        throw new Error('Drop faild.')
    }
};


module.exports = { updateSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng, dropCollectionMng };
