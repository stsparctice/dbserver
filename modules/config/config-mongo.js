const DBconfig = require('../../config/DBconfig.json');
const notifictaions = require('../../config/serverNotifictionsConfig.json');

function getCollectionsFromConfig(collectionName, config = DBconfig) {
    try {
        if (typeof collectionName !== 'string') {
            let error = notifictaions.find(({ status }) => status === 519);
            error.description += 'The collection name should be of type string';
            throw error;
        }
        let collection;
        try {
            let mongo = config.find(db => db.database === 'mongoDB');
            collection = mongo.collections.find(({ mongoName }) => mongoName === collectionName);
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 600);
            error.description += '(check the config file).';
            throw error;
        }
        if (!collection) {
            let error = notifictaions.find(n => n.status === 517);
            error.description = `Collection: ${collectionName} does not exsist.`;
            throw error;
        }
        return collection;
    }
    catch (error) {
        throw error;
    }

}

module.exports = {getCollectionsFromConfig}