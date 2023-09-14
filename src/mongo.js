const { MongoClient } = require('mongodb');
require('dotenv').config();

const dbName = 'Ozen'; // Your MongoDB database name
const collectionName = 'OzenCollection'; // Your collection name

async function connectToMongoDB() {
  const uri = process.env['mongo'];
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return { client, db, collection };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToMongoDB };