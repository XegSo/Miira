const { MongoClient } = require('mongodb');
require('dotenv').config();

/*
const dbName = 'Ozen'; // Your MongoDB database name
const collectionName = 'Special'; // Your collection name
const dbName = 'Ozen'; // Your MongoDB database name
const collectionName = 'Users'; // Your collection name
*/

async function connectToMongoDB(setCollection) {
    const uri = process.env.MONGO;
    const client = new MongoClient(uri);

    try {

        await client.connect();
        console.log(`Connected to MongoDB: Miira | ${setCollection}`);
        const db = client.db('Miira');
        const collection = db.collection(setCollection);
        return { client, db, collection };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = { connectToMongoDB };
