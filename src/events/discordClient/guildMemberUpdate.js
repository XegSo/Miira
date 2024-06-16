const localFunctions = require('../../functions');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, member) {
        let roles = member.roles.cache;
        const oldRoles = oldMember.roles.cache;

        let addedRoles = await roles.filter(role => !oldRoles.has(role.id));
        let removedRoles = await oldRoles.filter(role => !roles.has(role.id));

        roles = await member.roles.cache.map(role => role.name);
        addedRoles = await addedRoles.map(role => role.name);
        removedRoles = await removedRoles.map(role => role.name);

        if (addedRoles.size === 0 && removedRoles.size === 0) return;
        const addedBadges = localFunctions.updateBadges(addedRoles);
        const removedBadges = localFunctions.updateBadges(removedRoles);
        if (addedBadges.length === 0 && removedBadges.length === 0) return;


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
