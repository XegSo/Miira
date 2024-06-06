const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { collabCache } = require('./manage-pick-collab');
const { userCheckCache } = require('../../commands/collabs/collabs');

module.exports = {
    data: {
        name: "edit-fields-user-collab-admin"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
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
        let editString = '';
        let textEdits = false;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const collab = initializedMap.get(int.user.id).collab;
        const collabName = collab.name;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const participation = initializedMap.get(int.user.id).participation;
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);
        try {
            const userCollab = await localFunctions.getUserCollab(participation.discordId, collection, collabName);
            let av_text = int.fields.getTextInputValue('av_text');
            if (!av_text) {
                av_text = userCollab.av_text;
            } else {
                editString = editString.concat(`\n **Avatar text**: ${av_text}`);
                textEdits = true;
            }
            let ca_text = int.fields.getTextInputValue('ca_text');
            if (!ca_text) {
                ca_text = userCollab.ca_text;
            } else {
                editString = editString.concat(`\n **Card text**: ${ca_text}`);
                textEdits = true;
            }
            let ca_quote = int.fields.getTextInputValue('ca_quote');
            if (!ca_quote) {
                ca_quote = userCollab.ca_quote;
            } else {
                editString = editString.concat(`\n **Card quote**: ${ca_quote}`);
                textEdits = true;
            }

            if (textEdits) {
                await localFunctions.editParticipationFields(participation.discordId, collabName, av_text, ca_text, ca_quote, collection);
                await localFunctions.editCollabUserFields(participation.discordId, collabName, av_text, ca_text, ca_quote, collabCollection);

                const editEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Admin Action', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n📣 New Input Edit By Admins...\`\`\`**                                                                                                        **${collab.name}**\n${editString}`)
                logChannel.send({ content: `<@${participation.discordId}> Your input has been edited!\n**Reason:** ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}\n**Edited by:** <@${int.user.id}>`, embeds: [editEmbed] });

                const auditEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **The fields of an user have been edited!**\n\n**Pick Name**: ${participation.name}\n**Pick ID**: ${participation.id}\n**Owner**: <@${participation.discordId}>\n**Edited by**: <@${int.user.id}>\n**Reason**: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}\n${editString}`);
                auditChannel.send({ content: '', embeds: [auditEmbed] });
            }

            let newImg = int.fields.getTextInputValue('img');
            if (!newImg) return int.editReply('The fields have been edited.');
            if (!localFunctions.isPNGURL(newImg)) {
                if (textEdits) {
                    return int.editReply('The fields have been edited, but the image provided is not a PNG! Provide a PNG image to edit this field.');
                } else {
                    return int.editReply('The image provided is not a PNG! Provide a PNG image to edit this field.');
                }
            }
            let oldImg = participation.imgURL;
            await localFunctions.editPickImage(participation.id, participation.discordId, collab.name, collabCollection, collection, newImg);
            let imageSwapEmbed = new EmbedBuilder()
                .setFooter({ text: "Endless Mirage | Admin Action", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setTimestamp()
                .setImage(newImg)
                .setURL('https://endlessmirage.net/')
                .setDescription(`**\`\`\`📣 New Input Edit By Admins...\`\`\`**`)

            let oldImageEmbed = new EmbedBuilder()
                .setURL('https://endlessmirage.net/')
                .setImage(oldImg)

            logChannel.send({ content: `<@${participation.discordId}> Your image has been edited!\n**Reason:** ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}\n**Edited by:** <@${int.user.id}>`, embeds: [imageSwapEmbed, oldImageEmbed] });
            const auditEmbedImg1 = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setImage(newImg)
                .setURL('https://endlessmirage.net/')
                .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **An image has been edited!**\n\n**Pick Name**: ${participation.name}\n**Pick ID**: ${participation.id}\n**Owner**: <@${participation.discordId}>\n**Edited by**: <@${int.user.id}>\n**Reason**: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}`);
            let auditEmbedImg2 = new EmbedBuilder()
            .setURL('https://endlessmirage.net/')
            .setImage(oldImg)

            auditChannel.send({ content: '', embeds: [auditEmbedImg1, auditEmbedImg2] });

            await int.editReply('The image has been edited.');
        } finally {
            mongoClient.close();
            mongoClientCollabs.close();
        }
    },
};