const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { userCheckCache } = require('../../commands/collabs/collabs');
const { userCheckCacheModal } = require('../modals/check-pick');

module.exports = {
    data: {
        name: "report-user"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        let initializedMap;
        if (userCheckCache.size > 0) {
            if (typeof userCheckCache.get(userId) !== "undefined") {
                initializedMap = userCheckCache;
            }
        }
        if (userCheckCacheModal.size > 0) {
            if (typeof userCheckCacheModal.get(userId) !== "undefined") {
                initializedMap = userCheckCacheModal;
            }
        }
        let pick = initializedMap.get(userId).participation;
        if (pick.discordId === userId) return int.editReply('You cannot report yourself silly!');
        let status = 'Pending';
        let collab = initializedMap.get(userId).collab;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.reportsLogChannelID);
        let type = 'report'
        const reason = int.fields.getTextInputValue("reason");
        let reportEmbed = new EmbedBuilder()
            .setFooter({ text: "Endless Mirage | New Report", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp()
            .setURL('https://endlessmirage.net/')
            .setDescription(`**\`\`\`📣 New User Report\`\`\`**`)
            .addFields(
                {
                    name: '‎',
                    value: `┌ **Reported User**: <@${pick.discordId}>\n└ **Reported by**: <@${userId}>\n\n**Reason: **${reason}`
                },
                {
                    name: "‎",
                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                },
            )

        const message = await logChannel.send({
            embeds: [reportEmbed],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('report-accept')
                        .setLabel('Approve')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('report-deny')
                        .setLabel('Deny')
                        .setStyle('Danger'),
                ),
            ],
            ephemeral: true,
        });

        await localFunctions.updateReport(message.id, type, userId, pick.discordId, status, reportEmbed, collab.name, pick.id, reason);
        await int.editReply({ content: 'Your report has been sent successfully', ephemeral: true });
    },
};