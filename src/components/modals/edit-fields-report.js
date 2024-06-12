const { EmbedBuilder } = require('discord.js');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { reportCache } = require('../buttons/report-accept');

module.exports = {
    data: {
        name: "edit-fields-report"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        let editString = '';
        let textEdits = false;
        const collection = client.db.collection("OzenCollection");
        const collabCollection = client.db.collection("Collabs");
        const report = reportCache.get(int.user.id).report;
        const message = reportCache.get(int.user.id).message;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);

        const collab = await localFunctions.getCollab(report.collab, collabCollection);
        const collabName = collab.name;
        const participation = collab.participants.find((e) => e.id === report.pickId);
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

        let reportEmbed = new EmbedBuilder()
            .setFooter({ text: "Endless Mirage | Report Accepted", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp()
            .setURL('https://endlessmirage.net/')
            .setDescription(`**\`\`\`📣 Report Accepted\`\`\`**\n**Action taken:** Field edits\n**Admin:** <@${int.user.id}>`)
            .addFields(
                {
                    name: report.embed.data.fields[0].name,
                    value: report.embed.data.fields[0].value
                },
                {
                    name: report.embed.data.fields[1].name,
                    value: report.embed.data.fields[1].value
                }
            )

        await message.edit({ embeds: [reportEmbed], components: [] });
        await localFunctions.liquidateReport(report._id);
        const reporterMember = await guild.members.cache.find(member => member.id === report.reporterUser);
        try {
            reporterMember.send({
                content: `Your report for the user <@${report.reportedUser}> has been accepted and the fields of the user have been edited.`,
            });
        } catch (e) {
            console.log(e);
            const logChannel = guild.channels.cache.get(localConstants.logChannelID);
            logChannel.send({
                content: `<@${report.reporterUser}> Your report for the user <@${report.reportedUser}> has been accepted and the fields of the user have been edited.`,
            });
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
    }
};