const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const reportCache = new Map();

module.exports = {
    data: {
        name: 'report-accept'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const report = await localFunctions.getReportByMessage(client, int.message.id);
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(int.user.id);
        if (!guildMember.roles.cache.has('630636502187114496')) return int.editReply('You have no permission to do this!');
        if (typeof report === 'undefined') return int.editReply('Something went wrong...');
        let actionEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Accepting Report', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp()
            .setURL('https://endlessmirage.net/')
            .setDescription('**```🏐 Accepting a Report```**\n*Please select an action to issue.*')
            .addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>'
                }
            );
        const adminComponents = new ActionRowBuilder();

        adminComponents.addComponents(
            new ButtonBuilder()
                .setCustomId('remove-user-report')
                .setLabel('⛔️ Remove')
                .setStyle('Danger')
        );

        adminComponents.addComponents(
            new ButtonBuilder()
                .setCustomId('blacklist-user-report')
                .setLabel('⛔️ Blacklist')
                .setStyle('Danger')
        );

        adminComponents.addComponents(
            new ButtonBuilder()
                .setCustomId('edit-fields-report')
                .setLabel('🔄 Edit Fields')
                .setStyle('Primary')
        );

        await int.editReply({
            content: '',
            embeds: [actionEmbed],
            components: [adminComponents]
        });

        reportCache.set(int.user.id, {
            report: report,
            message: int.message
        });
    },
    reportCache: reportCache
};
