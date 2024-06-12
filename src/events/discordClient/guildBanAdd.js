const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    async execute(guild, user) {
        const userId = user.id;
        const collabLogChannel = guild.channels.cache.get(localConstants.logChannelID);
        const client = guild.client;
        const userCollection = client.db.collection("OzenCollection");
        const collection = client.db.collection("Collabs");
        const blacklistCollection = client.db.collection("Blacklist");
        
        let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
        if (typeof userCollabs === "undefined" || userCollabs.length === 0) return;
        console.log(`User ${user.tag} with id ${userId} has been banned while on collabs.`);
        await localFunctions.setBlacklist(userId, "Banned", user.osuData.osu_id, blacklistCollection);
        for (let userCollab of userCollabs) {
            let collab = await localFunctions.getCollab(userCollab.collabName, collection);
            if (collab.status !== "closed" && collab.status !== "delivered" && collab.status !== "archived" && collab.status !== "completed") {
                userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await localFunctions.unsetCollabParticipation(collab.name, collection, userCollab.collabPick.id);
                await localFunctions.removeCollabParticipant(collab.name, collection, userId);
                await localFunctions.unsetParticipationOnSheet(collab, userCollab.collabPick);
                await localFunctions.liquidateUserOsuData(userId, userCollection);
                const leaveEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${userCollab.collabPick.name}\nID: ${userCollab.collabPick.id}`)
                    .setImage(userCollab.collabPick.imgURL)
                collabLogChannel.send({ content: `User <@${userId}> has been banned.`, embeds: [leaveEmbed] });
            }
            console.log(`Participation removed from ${userCollab.collabName}`);
        }
    }
}