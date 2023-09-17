const localFunctions = require('../../functions');
const { registerFont } = require('canvas');
const { connectToMongoDB } = require('../../mongo');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(member) {
        let memberUpdated = (await member.guild.members.fetch({ user: member.user.id, force: true }));
        const roles = memberUpdated.roles.cache.map(role => role.name);
        badges = localFunctions.updateBadges(roles);
        console.log(badges)
        const { collection, client: mongoClient } = await connectToMongoDB();
        try {
            await localFunctions.setBadges(member.user.id, badges, collection);
            console.log(`Badges for user ${member.user.tag} have been updated`);
        } finally {
            mongoClient.close();
        }
    }
}