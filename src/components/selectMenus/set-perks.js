const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { connectToMongoDB } = require('../../mongo');
const { givePerksCache } = require('../../commands/tools/giveperks');

module.exports = {
    data: {
        name: 'set-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = givePerksCache.get(int.user.id);
        if (!pendingUser) return;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            let newPerks = [];
            const pendingPerks = int.values;
            let userPerks = await localFunctions.getPerks(pendingUser.user.id, collection) || [];
            for (const tier of localConstants.premiumTiers) {
                for (const perk of tier.perks) {
                    userPerks.forEach((existingPerk) => {
                        if (pendingPerks.includes(existingPerk.name)) return;
                    });
                    if (pendingPerks.includes(perk.name)) {
                        newPerks.push(perk);
                        await localFunctions.setPerks(pendingUser.user.id, newPerks, collection);
                        console.log(`Perk "${perk.name}" found in tier "${tier.name}"`);
                    }
                }
            }
            int.editReply(`Perks given to ${pendingUser.user.tag}`)
            givePerksCache.delete(int.user.id);
        } finally {
            mongoClient.close();
        }
    },
};