require('dotenv').config();
const { MongoClient } = require('mongodb');
const { MONGO_CONNECTION } = process.env;

let client = null;

const connectMng = async (server_url = MONGO_CONNECTION) => {
    if (server_url.indexOf('mongodb') != 0) {
        throw new Error('connection string is not in the right format');
    };
    client = new MongoClient(server_url);
    await client.connect();
    
};

const disconnect = async () => {
    if (client == null) {
        throw new Error('client is still null');
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
