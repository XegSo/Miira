const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const profileMenuCache = new Map();

module.exports = {
    data: {
        name: 'manage-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('OzenCollection');
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        try {
            const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            const userCollab = userCollabs.find(e => e.collabName === int.values[0]);
            let fullCollab = await localFunctions.getCollab(int.values[0], collection);
            const bumps = fullCollab.bumps;
            let userEntry = fullCollab.participants.find(i => i.discordId === userId);
            let pick = userCollab.collabPick;
            let components = [];
            let extraComponents = [];
            const dashboardEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Collab Profile', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setURL('https://endlessmirage.net/')
                .setDescription(`**\`\`\`\n🏐 ${userCollab.collabName}\`\`\`**\n**Joined <t:${userCollab.joinDate}:R>**`)
                .addFields(
                    {
                        name: '‎',
                        value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                        inline: true
                    },
                    {
                        name: '‎',
                        value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                        inline: true
                    },
                    {
                        name: '‎',
                        value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                    },
                    {
                        name: '‎',
                        value: `┌ Avatar Text: **${userCollab.av_text}**\n├ Card Text: **${userCollab.ca_text}**\n└ Card Quote: **${userCollab.ca_quote ? userCollab.ca_quote : 'None'}**`
                    },
                    {
                        name: '‎',
                        value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                    }
                );
            if (userEntry.bump_imune) {
                dashboardEmbed.addFields(
                    {
                        name: 'You are bump immune! How awesome.',
                        value: `Check the __**[Spreadsheet](https://docs.google.com/spreadsheets/d/${fullCollab.spreadsheetID})**__ for full collab information.`
                    }
                );
            } else if (typeof bumps !== 'undefined') {
                let completedBumps = 0;
                for (const bump of bumps) {
                    if (typeof bump.users.find(u => u.discordId === userId) !== 'undefined') {
                        completedBumps++;
                    }
                }
                if (completedBumps === 0) {
                    dashboardEmbed.addFields(
                        {
                            name: 'You have not completed any bumps! If you joined before the last bump started, you will lose your entry! Please go to the collabs announcement channel and click on the bump button ASAP!',
                            value: `Check the __**[Spreadsheet](https://docs.google.com/spreadsheets/d/${fullCollab.spreadsheetID})**__ for full collab information.`
                        }
                    );
                } else {
                    dashboardEmbed.addFields(
                        {
                            name: `You have completed ${completedBumps} bump(s) succesfully.`,
                            value: `Check the __**[Spreadsheet](https://docs.google.com/spreadsheets/d/${fullCollab.spreadsheetID})**__ for full collab information.`
                        }
                    );
                }
            }

            const embed2 = new EmbedBuilder()
                .setImage(pick.imgURL)
                .setURL('https://endlessmirage.net/');


            components = new ActionRowBuilder();

            let tier = 0;
            const userTier = await localFunctions.getUserTier(userId, userCollection);

            switch (fullCollab.status) {
            case 'early delivery':
                if (userTier) {
                    tier = localFunctions.premiumToInteger(userTier.name);
                } else if (guildMember.roles.cache.has('743505566617436301')) {
                    let premiumDetails = await localFunctions.assignPremium(userId, userCollection, guildMember);
                    tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                }
                if (tier >= 4) {
                    let downloadlInfo = fullCollab.downloadId.find(u => u.discordId === userId);
                    components.addComponents(
                        new ButtonBuilder()
                            .setLabel('⬇️ Download')
                            .setURL(`https://storage.googleapis.com/${fullCollab.bucket}/${downloadlInfo.id}.zip`)
                            .setStyle('Link')
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed, embed2],
                        components: [components]
                    });
                }
                break;
            case 'delivered':
            case 'completed':
            case 'archived':
                if (typeof fullCollab.invalidUsers.find(u => u === userId) === 'undefined') {
                    let downloadlInfo = fullCollab.downloadId.find(u => u.discordId === userId);
                    components.addComponents(
                        new ButtonBuilder()
                            .setLabel('⬇️ Download')
                            .setURL(`https://storage.googleapis.com/${fullCollab.bucket}/${downloadlInfo.id}.zip`)
                            .setStyle('Link')
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed, embed2],
                        components: [components]
                    });
                } else {
                    dashboardEmbed.addFields(
                        {
                            name: '‎',
                            value: '**Important:** You did not complete any bumps during the collab and your entry is locked. If you want to download your materials please open a ticket before the collab finishes.'
                        }
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed, embed2]
                    });
                }
                break;
            default:
                if (fullCollab.type === 'pooled') {
                    extraComponents = new ActionRowBuilder();
                    if (fullCollab.status !== 'full') {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('swap-pick')
                                .setLabel('🔁 Swap')
                                .setStyle('Primary')
                        );
                    }
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('trade-pick')
                            .setLabel('🔀 Trade')
                            .setStyle('Primary')
                    );
                    extraComponents.addComponents(
                        new ButtonBuilder()
                            .setCustomId('check-pick')
                            .setLabel('🔮 Check a Character')
                            .setStyle('Success')
                    );
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('change-texts')
                            .setLabel('📝 Edit')
                            .setStyle('Primary')
                    );
                    if (fullCollab.imageSwap) {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('swap-image')
                                .setLabel('🎨 Image')
                                .setStyle('Primary')
                        );
                    }
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('leave-collab')
                            .setLabel('🛫 Leave')
                            .setStyle('Danger')
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed, embed2],
                        components: [components, extraComponents]
                    });
                } else {
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('change-texts')
                            .setLabel('📝 Edit')
                            .setStyle('Primary')
                    );
                    if (fullCollab.imageSwap) {
                        components.addComponents(
                            new ButtonBuilder()
                                .setCustomId('swap-image')
                                .setLabel('🎨 Image')
                                .setStyle('Primary')
                        );
                    }
                    components.addComponents(
                        new ButtonBuilder()
                            .setCustomId('leave-collab')
                            .setLabel('🛫 Leave')
                            .setStyle('Danger')
                    );
                    await int.editReply({
                        content: '',
                        embeds: [dashboardEmbed, embed2],
                        components: [components]
                    });
                }
            }

            profileMenuCache.set(int.user.id, {
                collab: fullCollab
            });

        } catch (e) {
            console.log(e);
            await int.editReply('Something went wrong...');
        }
    },
    profileMenuCache
};
