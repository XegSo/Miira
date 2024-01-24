const path = require('path');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { yeetCache } = require('../buttons/remove-user-collab');

module.exports = {
    data: {
        name: "remove-user-collab"
    },
    async execute(int, client) {
        await int.deferReply({ephemeral: true});
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);

        try {
            const collab = yeetCache.get(int.user.id).collab;
            let id = int.fields.getTextInputValue('pick');
            let pool = collab.pool.items;
            let digits = pool[0].id.length;
            id = localFunctions.padNumberWithZeros(parseInt(id), digits);
            const pickFull = pool.find((e) => e.id === id);
            if (yeetCache.get(int.user.id).collab.host === int.user.id) {
                if (typeof pickFull === "undefined") {
                    return await int.editReply('Invalid character ID!');
                }
                if (pickFull.status === "available") {
                    return await int.editReply('No user found with this pick!');
                }
                let participants = collab.participants;
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
                    .setDescription(`**\`\`\`ml\n🎫 New Character Available!\`\`\`**                                                                                    **${collab.name}**\nName:${pickFull.name}\nID: ${pickFull.id}`)
                    .setImage(pickFull.imgURL)
                logChannel.send({ content: `User <@${fullParticipation.discordId}> has been removed from the collab.\nReason: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}`, embeds: [leaveEmbed] });

                await int.editReply('The user has been removed from the collab.');
                yeetCache.delete(int.user.id);
            } else {
                await int.editReply('Something went wrong.');
                return;
            }
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};