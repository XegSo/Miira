const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { resetCache } = require('../buttons/reset-collab');

module.exports = {
    data: {
        name: `reset-collab`
    },
    async execute(int, client) {
        await int.deferReply();
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        
        try {
            let name = int.fields.getTextInputValue('name');
            if (resetCache.get(int.user.id).collab.host === int.user.id && resetCache.get(int.user.id).collab.name === name) {
                await localFunctions.liquidateCollabUsers(resetCache.get(int.user.id).collab.name, collection);
                await localFunctions.liquidateCollabFromUsers(resetCache.get(int.user.id).collab.name, userCollection);
                await localFunctions.resetPickStatus(resetCache.get(int.user.id).collab.name, collection);
                await localFunctions.setSheetFromZero(resetCache.get(int.user.id).collab, resetCache.get(int.user.id).collab.pool.items)
                await int.editReply('The collab\'s picks have been reset.');
                resetCache.delete(int.user.id);
            } else {
                await int.editReply('Verification for reset failed.');
                return;
            }
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};