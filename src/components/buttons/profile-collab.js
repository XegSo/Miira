const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'profile-collab'
    },
    async execute(int, client) {
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        try {
            const userOsu = await localFunctions.getOsuData(userId, collection);
            const lastUpdate = await localFunctions.getUserLastUpdate(userId, collection);
            const currentDate = new Date();
            if (!userOsu) {
                const components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('link-osu')
                        .setLabel('🔗 Link your osu! Account')
                        .setStyle('Success'),
                )
                await int.editReply({
                    content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                    components: [components]
                });
                return;
            }
            const collabData = await localFunctions.getUserCollabs(userId, collection);
            const collabs = await localFunctions.getCollabs(collabCollection);
            let buttons;

            let tier = 0;
            let prestigeLevel = 0;
            let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
            if (typeof prestige !== "undefined") {
                prestige = prestige.name

                prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
            }
            const userTier = await localFunctions.getUserTier(userId, collection);
            if (userTier) {
                console.log(userTier);
                tier = localFunctions.premiumToInteger(userTier.name);
            } else if (guildMember.roles.cache.has('743505566617436301')) {
                let premiumDetails = await localFunctions.assignPremium(int, userId, collection, guildMember);
                tier = localFunctions.premiumToInteger(premiumDetails[0].name);
            }

            const osuEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setThumbnail(userOsu.avatar_url)
                .addFields(
                    {
                        name: `‎`,
                        value: `┌ Username: **${userOsu.username}**\n├ Country: **${tools.country(userOsu.country_code)}**\n├ Rank: **${userOsu.statistics.global_rank}**\n├ Peak Rank: **${userOsu.rank_highest.rank}**\n└ Level: **${userOsu.statistics.level.current}**`,
                        inline: true
                    },
                    {
                        name: `‎`,
                        value: `┌ Performance: **${userOsu.statistics.pp}pp**\n├ Join date: **<t:${new Date(userOsu.join_date).getTime() / 1000}:R>**\n├ Prestige Level: **${prestigeLevel}**\n├ Premium Tier: **${tier}**\n└ Playtime: **${Math.floor(userOsu.statistics.play_time / 3600)}h**`,
                        inline: true
                    },
                    {
                        name: `‎`,
                        value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                    },
                )
            if (typeof userOsu.skillRanks !== 'undefined') {
                osuEmbed.addFields(
                    {
                        name: `‎`,
                        value: `┌ ACC: **${userOsu.skillRanks[0].rank}** | Score: **${userOsu.skillRanks[0].int}**\n├ REA: **${userOsu.skillRanks[1].rank}** | Score: **${userOsu.skillRanks[1].int}**\n├ AIM: **${userOsu.skillRanks[2].rank}** | Score: **${userOsu.skillRanks[2].int}**\n├ SPD: **${userOsu.skillRanks[3].rank}** | Score: **${userOsu.skillRanks[3].int}**\n├ STA: **${userOsu.skillRanks[4].rank}** | Score: **${userOsu.skillRanks[4].int}**\n└ PRE: **${userOsu.skillRanks[5].rank}** | Score: **${userOsu.skillRanks[5].int}**`,
                        inline: true
                    },
                    {
                        name: `‎`,
                        value: `┌ Top 1 Mod: **${userOsu.modsData.top4Mods[0].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[0].percentage)}%**\n├ Top 2 Mod: **${userOsu.modsData.top4Mods[1].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[1].percentage)}%**\n├ Top 3 Mod: **${userOsu.modsData.top4Mods[2].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[2].percentage)}%**\n├ Top 4 Mod: **${userOsu.modsData.top4Mods[3].mod}** | Usage: **${Math.round(userOsu.modsData.top4Mods[3].percentage) ? Math.round(userOsu.modsData.top4Mods[3].percentage) : userOsu.modsData.top4Mods[3].percentage}%**\n└ Most used combination: **${userOsu.modsData.mostCommonModCombination.combination}**`,
                        inline: true
                    }
                )
            }

            if (!lastUpdate || (currentDate - lastUpdate) > 7 * 24 * 60 * 60 * 1000) {
                buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🔄 Update your data')
                        .setCustomId('refresh-osu-data')
                        .setStyle('Primary')
                )
                osuEmbed.addFields(
                    {
                        name: `*You are able to update your analytics.*`,
                        value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                    }
                )
            } else {
                buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🔄 Update your data')
                        .setCustomId('refresh-osu-data')
                        .setStyle('Primary')
                        .setDisabled(true),
                )
                osuEmbed.addFields(
                    {
                        name: `*You can update your analytics <t:${Math.floor(lastUpdate.getTime() / 1000 + 604800)}:R>.*`,
                        value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                    }
                )
            }

            if (tier) {
                osuEmbed.setFooter({ text: 'Endless Mirage | Collabs Profile | You\'re bump immune!', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            } else {
                osuEmbed.setFooter({ text: 'Endless Mirage | Collabs Profile', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            }

            const userPerks = await localFunctions.getPerks(userId, collection);
            let collabsToJoinCount = 0;
            const joinMenu = new SelectMenuBuilder()
                .setCustomId('select-collab')
                .setPlaceholder('Select a collab to join.')
            for (const collab of collabs) {
                if (((collab.status !== "closed" && collab.status !== "on design") || userId == '687004886922952755') && typeof collabData.find(e => e.collabName === collab.name) === "undefined") {
                    switch (collab.restriction) {
                        case "staff":
                            if (guildMember.roles.cache.has('961891383365500938') || userId == '687004886922952755') {
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                            }
                            collabsToJoinCount++;
                            break;
                        case "deluxe":
                            const deluxeEntry = await localFunctions.getDeluxeEntry(userId, collection);
                            if (deluxeEntry || userId == '687004886922952755') {
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                            }
                            collabsToJoinCount++;
                            break;
                        case "megacollab":
                            if ((collab.status === "early access" && typeof userPerks.find(e => e.name === "Megacollab Early Access")) || userId == '687004886922952755') {
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                            }
                            collabsToJoinCount++;
                            break;
                        case "prestige":
                            if (typeof prestige !== "undefined" || userId == '687004886922952755') {
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                            }
                            collabsToJoinCount++;
                            break;
                        case "experimental":
                            if (tier > 0 || prestigeLevel >= 4 || userId == '687004886922952755') {
                                joinMenu.addOptions({ label: collab.name, value: collab.name });
                            }
                            collabsToJoinCount++;
                            break;
                        case "none":
                            joinMenu.addOptions({ label: collab.name, value: collab.name });
                            collabsToJoinCount++;
                            break;
                    }
                }
            }
            const joinMenuRow = new ActionRowBuilder().addComponents(joinMenu);
            if (collabData.length === 0) {
                if (collabsToJoinCount === 0) {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you haven't joined any collab yet...*\n*Unfortunately, there isn't any collabs you can join at the moment.*`)
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [buttons]
                    })
                } else {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Seems like you haven't joined any collab yet...*\n`)
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [buttons, joinMenuRow]
                    })
                }
            } else {
                const manageMenu = new SelectMenuBuilder()
                    .setCustomId('manage-collab')
                    .setPlaceholder('Select a collab to manage.')
                for (const currentCollab of collabData) {
                    manageMenu.addOptions({ label: currentCollab.collabName, value: currentCollab.collabName });
                }
                const manageMenuRow = new ActionRowBuilder().addComponents(manageMenu);
                if (collabsToJoinCount === 0) {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                     *Unfortunately, there isn't any collabs you can join at the moment.*`);
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [buttons, manageMenuRow]
                    })
                } else {
                    osuEmbed.setDescription(`**\`\`\`ml\n🏐 Welcome ${int.user.globalName}!\`\`\`**                                                                                    `);
                    await int.editReply({
                        content: '',
                        embeds: [osuEmbed],
                        components: [buttons, manageMenuRow, joinMenuRow]
                    })
                }
            }
        } finally {
            mongoClient.close();
            mongoClientCollabs.close();
        }
    },
};