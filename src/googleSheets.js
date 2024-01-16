require('dotenv').config();
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const atob = require('atob');
const keyJson = JSON.parse(atob(process.env.ENCODED_GOOGLE_KEY));

const serviceAccountAuth = new JWT({
  email: keyJson.client_email,
  key: keyJson.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

async function connectToSpreadsheet(id) {
  const doc = new GoogleSpreadsheet(id, serviceAccountAuth);
  await doc.loadInfo();
  console.log('Spreadsheet has been loaded.')
  return doc;
}

module.exports = { connectToSpreadsheet };