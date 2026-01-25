const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        client.connect()
            .then((client) => {
                dbConnection = client.db();
                return cb();
            })
            .catch(err => {
                console.error(err);
                return cb(err);
            });
    },
    getDb: () => dbConnection
};
