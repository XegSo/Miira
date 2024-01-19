const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { deleteCache } = require('../buttons/delete-collab');

module.exports = {
    data: {
        name: `delete-collab`
    },
    async execute(int, client) {
        await int.deferReply();
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        
        try {
            let name = int.fields.getTextInputValue('name');
            if (deleteCache.get(int.user.id).collab.host === int.user.id && deleteCache.get(int.user.id).collab.name === name) {
                await localFunctions.liquidateCollab(deleteCache.get(int.user.id).collab.name, collection);
                await int.editReply('The collab has been deleted.');
                deleteCache.delete(int.user.id);
            } else {
                await int.editReply('Verification for deletion failed.');
                return;
            }
        } finally {
            mongoClient.close();
        }
    },
};