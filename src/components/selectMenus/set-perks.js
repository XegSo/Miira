const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { givePerksCache } = require('../../commands/admin/admin');

module.exports = {
    data: {
        name: 'set-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = givePerksCache.get(int.user.id);
        if (!pendingUser) return;
        const collection = client.db.collection('Users');

        const pendingPerks = int.values;
        let userPerks = await localFunctions.getPerks(pendingUser.user.id, collection) || [];
        for (const tier of localConstants.premiumTiers) {
            for (const perk of tier.perks) {
                if (pendingPerks.includes(perk.name) && !(userPerks.some(userPerk => userPerk.name === perk.name))) {
                    userPerks.push(perk);
                    await localFunctions.setPerks(pendingUser.user.id, userPerks, collection);
                }
            }
        }

        await int.editReply(`Perks given to <@${pendingUser.user.id}>`);
        givePerksCache.delete(int.user.id);
    }
};
