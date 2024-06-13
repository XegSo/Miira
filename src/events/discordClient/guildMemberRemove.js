const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const userId = member.user.id;
        const collabLogChannel = member.guild.channels.cache.get(localConstants.logChannelID);
        const userCollection = member.client.db.collection('OzenCollection');
        const collection = member.client.db.collection('Collabs');

        let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
        if (typeof userCollabs === 'undefined' || userCollabs.length === 0) return;
        console.log(`User ${member.user.tag} with id ${userId} has left the server while on collabs.`);
        for (let userCollab of userCollabs) {
            let collab = await localFunctions.getCollab(userCollab.collabName, collection);
            if (collab.status !== 'closed' && collab.status !== 'delivered' && collab.status !== 'archived' && collab.status !== 'completed') {
                userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await localFunctions.unsetCollabParticipation(collab.name, collection, userCollab.collabPick.id);
                await localFunctions.removeCollabParticipant(collab.name, collection, userId);
                await localFunctions.unsetParticipationOnSheet(collab, userCollab.collabPick);
                const leaveEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${userCollab.collabPick.name}\nID: ${userCollab.collabPick.id}`)
                    .setImage(userCollab.collabPick.imgURL);
                collabLogChannel.send({ content: `User <@${userId}> has left the server.`, embeds: [leaveEmbed] });
            }
            console.log(`Participation removed from ${userCollab.collabName}`);
        }
    }
};
