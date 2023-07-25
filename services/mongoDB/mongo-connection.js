require('dotenv').config();
const { MongoClient } = require('mongodb');
const { MONGO_CONNECTION } = process.env;
const notifictions = require('../../config/serverNotifictionsConfig.json')

let client = null;

const connectMng = async (server_url = MONGO_CONNECTION) => {
    if (!MONGO_CONNECTION) {
        throw notifictions.find(n => n.status === 509)
    }
    if (server_url.indexOf('mongodb') != 0) {
        let description = 'Connection string is not in the right format'
        let error = notifictions.find(n => n.status === 421)
        error.description = description
        throw error;
    };
    client = new MongoClient(server_url);
    await client.connect();

};

const disconnect = async () => {
    if (client == null) {
        let error = notifictions.find(n => n.status === 500)
        error.description += '(client is still null)'
        throw error;
    };
    await client.close();
};

const getClient = () => {
    return client;
};

module.exports = {
    connectMng,
    disconnect,
    getClient
};
