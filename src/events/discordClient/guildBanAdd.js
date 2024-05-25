const localConstants = require('../../constants');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    async execute(guild, user) {
        const userId = user.id;
        const collabLogChannel = guild.channels.cache.get(localConstants.logChannelID);
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        try {
            let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            if (typeof userCollabs === "undefined") return;
            console.log(`User ${user.tag} with id ${userId} has left the server while on collabs.`);
            for (let userCollab of userCollabs) {
                let collab = await localFunctions.getCollab(userCollab.collabName, collection);
                if (collab.status !== "closed" && collab.status !== "delivered" && collab.status !== "archived" && collab.status !== "completed") {
                    userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
                    await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                    await localFunctions.unsetCollabParticipation(collab.name, collection, userCollab.collabPick.id);
                    await localFunctions.removeCollabParticipant(collab.name, collection, userId);
                    await localFunctions.unsetParticipationOnSheet(collab, pickFull);
                    const leaveEmbed = new EmbedBuilder()
                        .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                        .setColor('#f26e6a')
                        .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${userCollab.collabPick.name}\nID: ${userCollab.collabPick.id}`)
                        .setImage(pickFull.imgURL)
                    logChannel.send({ content: `User <@${userId}> has been banned.`, embeds: [leaveEmbed] });
                }
                collabLogChannel.log(`Participation removed from ${userCollab.collabName}`);
            }
        } finally {
            mongoClientUsers.close()
            mongoClient.close()
        }
    }
}