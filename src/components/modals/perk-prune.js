const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { managePerkCache } = require('../selectMenus/manage-perks');

module.exports = {
    data: {
        name: "perk-prune"
    },
    async execute(int, client) {
        await int.deferReply({ephemeral: true});
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        try {
            let name = int.fields.getTextInputValue('name');
            const collabName = managePerkCache.get(int.user.id).collabName;
            const perkName = managePerkCache.get(int.user.id).perkName;
            if (name === perkName) {
                await localFunctions.liquidatePerkEntry(int.user.id, collabName, perkName, collection);

                await int.editReply('Your entry has been removed.');
                managePerkCache.delete(int.user.id);
            } else {
                await int.editReply('Verification for removal failed.');
                return;
            }
        } finally {
            mongoClient.close();
        }
    },
};