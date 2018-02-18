'use strict';

const mongoClient = require('mongodb').MongoClient;

module.exports = async function() {
    logger.info("Connecting to database...");

    try {
        let client = await mongoClient.connect(process.env.MONGODB_URL);
        let db = client.db(process.env.MONGODB_DATABASE_NAME);

        logger.info("Connected to database successfully.");

        global.db = db;
    } catch(err) {
        logger.error('Failed to connect to MongoDB database, exiting, please check your config');
        process.exit(1);
    }
};
