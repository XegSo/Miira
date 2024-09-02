const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const userId = member.user.id;
        const collabLogChannel = member.guild.channels.cache.get(localConstants.logChannelID);
        const userCollection = member.client.db.collection('Users');
        const collection = member.client.db.collection('Collabs');

        let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
        if (typeof userCollabs === 'undefined' || userCollabs.length === 0) return;
        console.log(`User ${member.user.tag} with id ${userId} has left the server while on collabs.`);
        for (let userCollab of userCollabs) {
            let collab = await localFunctions.getCollab(userCollab.collabName, collection);
            let contentString = '';
            const snipes = await localFunctions.getCollabSnipes(userCollab.collabName, collection, userCollab.collabPick.id);
            if (typeof snipes !== 'undefined') {
                if (typeof snipes.find(p => p.pick === userCollab.collabPick.id) !== 'undefined') {
                    contentString = 'Snipers! ';
                }
                for (const snipe of snipes) {
                    contentString = contentString.concat('', `<@${snipe.userId}>`);
                    await localFunctions.removeCollabSnipe(collab.name, collection, snipe.userId);
                }
            }
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
                await collabLogChannel.send({ content: `${contentString}\nUser ${member.user.tag} has left the server.`, embeds: [leaveEmbed] });
            }
            console.log(`Participation removed from ${userCollab.collabName}`);
        }
    }
};
