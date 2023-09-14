const { MongoClient } = require('mongodb');
require('dotenv').config();

const dbName = 'Ozen'; // Your MongoDB database name
const collectionName = 'Special'; // Your collection name

async function connectToMongoDBSpecial() {
  const uri = process.env['mongo'];
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Special');
    const db = client.db(dbName);
    const collectionSpecial = db.collection(collectionName);
    return { client, db, collectionSpecial };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToMongoDBSpecial };