const localFunctions = require('../../functions');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, member) {
        const roles = member.roles.cache.map(role => role.name);
        let badges = localFunctions.updateBadges(roles);
        const collection = member.client.db.collection('OzenCollection');
        let userInventory = await localFunctions.getInventory(member.user.id, collection) || [];
        let onUse = await localFunctions.getOnUse(member.user.id, collection);

        await localFunctions.setBadges(member.user.id, badges, collection);
        console.log(`Badges for user ${member.user.tag} have been updated`);
        await localFunctions.updateNonPurchaseableCosmetics(member.user.id, collection, roles, userInventory, onUse); // Updates cosmetics
        console.log(`Cosmetics for user ${member.user.tag} have been updated`);
    }
};
