const localFunctions = require('../../functions');
const { connectToMongoDB } = require('../../mongo');
const { removePerksCache } = require('../../commands/tools/removeperks');

module.exports = {
    data: {
        name: 'remove-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = removePerksCache.get(int.user.id);
        if (!pendingUser) return;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            const pendingPerks = int.values;
            let userPerks = await localFunctions.getPerks(pendingUser.user.id, collection) || [];

            const newPerks = userPerks.filter(perk => !pendingPerks.includes(perk.name));
            await localFunctions.setPerks(pendingUser.user.id, newPerks, collection);
            await int.editReply(`<@${pendingUser.user.id}>'s perks have been updated.`)
            removePerksCache.delete(int.user.id);
        } finally {
            mongoClient.close();
        }
    },
};