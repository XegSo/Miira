const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { buttonCache } = require('../selectMenus/select-collab');
const collabCache = new Map();

module.exports = {
    data: {
        name: 'admin-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(int.user.id);
        if (!guildMember.roles.cache.has(localConstants.collabAdminsRoleID)) return;
        const collection = client.db.collection('Collabs');

        try {
            let collab = await localFunctions.getCollab(buttonCache.get(int.user.id).collab, collection);
            let components = [];
            let extraComponents = [];
            let URLstring = '';
            if (typeof collab.spreadsheetID !== 'undefined') {
                URLstring = `  [Spreadsheet URL](https://docs.google.com/spreadsheets/d/${collab.spreadsheetID})\n`;
            }
            const dashboardEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`ml\n🧱 Endless Mirage | Admin Collabs Dashboard\`\`\`**\n**${collab.name}**\n${URLstring}`);

            let extraString = '';

            if (collab.user_cap !== 0) {
                extraString = `User Limit: ${collab.user_cap}\n`;
            } else {
                extraString = 'Unlimited\n';
            }

            dashboardEmbed.addFields(
                {
                    name: '‎',
                    value: `┌ Type: ${localFunctions.capitalizeFirstLetter(collab.type)}\n├ Topic: ${localFunctions.capitalizeFirstLetter(collab.topic)}\n└ Status: ${localFunctions.capitalizeFirstLetter(collab.status)}\n`,
                    inline: true
                }
            );

            dashboardEmbed.addFields(
                {
                    name: '‎',
                    value: `┌ Class: ${localFunctions.capitalizeFirstLetter(collab.restriction)}\n├ Opening date: <t:${parseInt(collab.opening)}:R>\n└ ${extraString}`,
                    inline: true
                }
            );

            dashboardEmbed.addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                }
            );

            if (int.user.id === collab.host) {
                components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit-collab')
                        .setLabel('✏️ Edit')
                        .setStyle('Primary')
                );
                if (collab.type === 'pooled') {
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('pool-collab')
                            .setLabel('📁 Pool')
                            .setStyle('Primary')
                    );
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('manage-pick-collab')
                            .setLabel('🔩 Picks')
                            .setStyle('Primary')
                    );
                }

                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('reset-collab')
                        .setLabel('🔁 Reset')
                        .setStyle('Danger')
                );

                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('delete-collab')
                        .setLabel('🚮 Delete')
                        .setStyle('Danger')
                );

                if (collab.status !== 'on design' || int.user.id === '687004886922952755' || int.user.id === collab.host) {
                    extraComponents = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('export-collab')
                            .setLabel('⬇️ Export')
                            .setStyle('Success')
                    );
                    if (typeof collab.perks !== 'undefined') {
                        extraComponents.addComponents(
                            new ButtonBuilder()
                                .setCustomId('export-collab-perks')
                                .setLabel('⬇️ Perks')
                                .setStyle('Success')
                        );
                    }
                    extraComponents.addComponents(
                        new ButtonBuilder()
                            .setCustomId('deliver-collab')
                            .setLabel('⬆️ Deliver')
                            .setStyle('Success')
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed],
                        components: [components, extraComponents]
                    });
                } else {
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed],
                        components: [components]
                    });
                }

            } else {
                components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('manage-pick-collab')
                        .setLabel('🔩 Picks')
                        .setStyle('Primary')
                );
                if (collab.status !== 'on design') {
                    extraComponents = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('export-collab')
                            .setLabel('⬇️ Export')
                            .setStyle('Success')
                    );
                }
                await int.editReply({
                    content: '',
                    embeds: [dashboardEmbed],
                    components: [components]
                });
            }

            collabCache.set(int.user.id, {
                collab: collab
            });

        } catch (e) {
            console.log(e);
            await int.editReply('Something went wrong...');
        }
    },
    collabCache: collabCache
};
