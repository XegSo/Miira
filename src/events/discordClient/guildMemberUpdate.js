const localFunctions = require('../../functions');
const { connectToMongoDB } = require('../../mongo');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(member) {
        let memberUpdated = (await member.guild.members.fetch({ user: member.user.id, force: true }));
        const roles = memberUpdated.roles.cache.map(role => role.name);
        let badges = localFunctions.updateBadges(roles);
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        let userInventory = await localFunctions.getInventory(member.user.id,  collection) || [];
        let onUse = await localFunctions.getOnUse(member.user.id, collection);
        try {
            await localFunctions.setBadges(member.user.id, badges, collection);
            console.log(`Badges for user ${member.user.tag} have been updated`); 
            await localFunctions.updateNonPurchaseableCosmetics(member.user.id, collection, roles, userInventory, onUse) //Updates cosmetics
            console.log(`Cosmetics for user ${member.user.tag} have been updated`); 
        } finally {
            mongoClient.close();
        }
    }
}