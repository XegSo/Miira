const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { collabCache } = require('./manage-pick-collab');
const { userCheckCache } = require('../../commands/collabs/collabs');

module.exports = {
    data: {
        name: "remove-user-collab-admin"
    },
    async execute(int, client) {
        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== "undefined") {
                initializedMap = collabCache;
            }
        }
        if (userCheckCache.size > 0) {
            if (typeof userCheckCache.get(int.user.id) !== "undefined") {
                initializedMap = userCheckCache;
            }
        }
        await int.deferReply({ephemeral: true});
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);

        try {
            const collab = initializedMap.get(int.user.id).collab;
            const pickFull = initializedMap.get(int.user.id).pick;
            let participants = collab.participants;
            const id = pickFull.id;
            const fullParticipation = participants.find((e) => e.id === id);

            let userCollabs = await localFunctions.getUserCollabs(fullParticipation.discordId, userCollection);
            await localFunctions.unsetCollabParticipation(collab.name, collection, id);
            userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
            await localFunctions.setUserCollabs(fullParticipation.discordId, userCollabs, userCollection);
            await localFunctions.removeCollabParticipant(collab.name, collection, fullParticipation.discordId);
            await localFunctions.unsetParticipationOnSheet(collab, pickFull);

            const leaveEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`ml\n📣 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${pickFull.name}\nID: ${pickFull.id}`)
                .setImage(pickFull.imgURL)
            logChannel.send({ content: `User <@${fullParticipation.discordId}> has been removed from the collab.\n**Reason:** ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}\n**Removed by:** <@${int.user.id}>`, embeds: [leaveEmbed] });

            const auditEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **An user has been removed from the collab!**\n\n**Pick Name**: ${pickFull.name}\n**Pick ID**: ${pickFull.id}\n**Ex-Owner**: <@${fullParticipation.discordId}>\n**Removed by**: <@${int.user.id}>\n**Reason**: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}`);
            auditChannel.send({ content: '', embeds: [auditEmbed] });
            await int.editReply('The user has been removed from the collab.');
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};