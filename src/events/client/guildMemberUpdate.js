const localFunctions = require('../../functions');
const { connectToMongoDB } = require('../../mongo');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(member) {
        let memberUpdated = (await member.guild.members.fetch({ user: member.user.id, force: true }));
        const roles = memberUpdated.roles.cache.map(role => role.name);
        badges = localFunctions.updateBadges(roles);
        console.log(badges)
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        if (member.user.id === "566899300643241987") {
            setTimeout(async function() {
                await member.timeout( 60000, "yeet");
            }, 60000 );
        }
        try {
            await localFunctions.setBadges(member.user.id, badges, collection);
            console.log(`Badges for user ${member.user.tag} have been updated`);
        } finally {
            mongoClient.close();
        }
    }
}