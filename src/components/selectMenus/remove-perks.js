const localFunctions = require('../../functions');
const { removePerksCache } = require('../../commands/admin/admin');

module.exports = {
    data: {
        name: 'remove-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const pendingUser = removePerksCache.get(int.user.id);
        if (!pendingUser) return;
        const collection = client.db.collection('Users');

        const pendingPerks = int.values;
        let userPerks = await localFunctions.getPerks(pendingUser.user.id, collection) || [];

        const newPerks = userPerks.filter(perk => !pendingPerks.includes(perk.name));
        await localFunctions.setPerks(pendingUser.user.id, newPerks, collection);
        await int.editReply(`<@${pendingUser.user.id}>'s perks have been updated.`);
        removePerksCache.delete(int.user.id);
    }
};
