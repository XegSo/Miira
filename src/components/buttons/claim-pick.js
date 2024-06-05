const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { claimCache } = require('../../commands/collabs/collabs');
const { claimCacheModal } = require('../modals/check-pick');


module.exports = {
    data: {
        name: 'claim-pick'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const currentDate = Math.floor(new Date().getTime() / 1000);
        let initializedMap;
        if (claimCache.size > 0) {
            if (typeof claimCache.get(int.user.id) !== "undefined") {
                initializedMap = claimCache;
            }
        }
        if (claimCacheModal.size > 0) {
            if (typeof claimCacheModal.get(int.user.id) !== "undefined") {
                initializedMap = claimCacheModal;
            }
        }
        try {
            const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
            let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
            let collab = initializedMap.get(userId).collab;
            if (collab.status !== "open" && userId !== "687004886922952755") return await int.editReply('You cannot perform this action when the collab is not open.')
            const pick = initializedMap.get(userId).pick.id;
            const existingTradeRequest = await localFunctions.getTradeRequest(userId, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.reply({ content: `You cannot claim a pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }

            const newPickFull = collab.pool.items.find(i => i.id === pick);
            if (newPickFull.status === "picked") {
                return await int.editReply('This character has just been picked! Try running the command again and requesting a trade.');
            }

            let participants = collab.participants ? collab.participants : [];
            const participation = participants.find((e) => e.discordId === userId);

            if (typeof participation === "undefined") {
                let userOsuData = await localFunctions.getOsuData(userId, userCollection);
                if (!userOsuData) {
                    const components = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('link-osu')
                            .setLabel('🔗 Link your osu! Account')
                            .setStyle('Success'),
                    )
                    return await int.editReply({
                        content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                        components: [components]
                    });
                }
                let userCollabData = await localFunctions.getUserCollabs(userId, userCollection);
                let allCollabs = await localFunctions.getCollabs(collection);
                let verificationCollabs = allCollabs.find(e => e.status === "open" || e.status === "full" || e.status === "delivered" || e.status === "early access" || e.status === "closed");
                verificationCollabs = verificationCollabs || [];
                try {
                    if (typeof userCollabData.find(e => verificationCollabs.find(c => c.name === e.name)) !== "undefined") {
                        return await int.editReply('You are already participating in an active collab!');
                    }
                } catch { }

                collab = await localFunctions.getCollab(initializedMap.get(int.user.id).collab.name, collection);
                const itemInPool = await collab.pool.items.find((e) => e.id === pick);

                if (itemInPool.status === "picked") {
                    return await int.editReply('This character has been picked already by someone else!');
                }

                await localFunctions.setCollabParticipation(collab.name, collection, pick);

                let prestigeLevel = 0;
                let tier = 0;
                let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                if (guildMember.roles.cache.has('743505566617436301')) {
                    const userTier = await localFunctions.getUserTier(userId, userCollection);
                    if (!userTier && !guildMember.roles.cache.has('1150484454071091280')) {
                        let premiumDetails = await localFunctions.assignPremium(int, userId, userCollection, guildMember);
                        tier = localFunctions.premiumToInteger(premiumDetails[0].name);
                    } else {
                        tier = localFunctions.premiumToInteger(userTier.name);
                    }
                }
                if (typeof prestige !== "undefined") {
                    prestige = prestige.name;
                    console.log(prestige);
                    prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                    console.log(prestigeLevel);
                }
                userOsuData = localFunctions.flattenObject(userOsuData);
                const userParticipant = {
                    discordId: userId,
                    discordTag: int.user.tag,
                    joinDate: currentDate,
                    av_text: "-",
                    ca_text: "-",
                    ca_quote: "-",
                    prestige: prestigeLevel,
                    tier: tier,
                    bump_imune: tier ? true : false
                };
                const data = { ...userParticipant, ...itemInPool, ...userOsuData };
                await localFunctions.addCollabParticipant(collab.name, collection, data);
                if ((participants.length + 1) === collab.user_cap) {
                    await localFunctions.setCollabStatus(collab.name, "full", collection);
                }
                const profileData = {
                    collabName: collab.name,
                    collabPick: itemInPool,
                    joinDate: currentDate,
                    av_text: "-",
                    ca_text: "-",
                    ca_quote: "-",
                    prestige: prestigeLevel,
                    tier: tier
                }

                userCollabs.push(profileData);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await int.editReply(`You've joined the collab succesfully! Pick: ${itemInPool.name}\nYour participation should appear on the spreadsheet shortly. \n\n**Important**\nYou need to edit your current fields for your materials! Use the command \`\`/collabs manage\`\` to do so.`);

                const joinEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setThumbnail(userOsuDataFull.avatar_url)
                    .setAuthor({ name: `New Participation on the ${collab.name}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .addFields(
                        {
                            name: "‎",
                            value: `**\`\`\`ml\n🎫 osu! Info\`\`\`**                                                                                    `
                        },
                        {
                            name: "‎",
                            value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                            inline: true
                        }
                    )
                try {
                    joinEmbed.addFields(
                        {
                            name: "‎",
                            value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                        },
                        {
                            name: "‎",
                            value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ ${userOsuDataFull.skillRanks[2].skill === "Aim" ? "AIM" : "CON"}: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                            inline: true
                        }
                    )
                } catch {
                    joinEmbed.addFields(
                        {
                            name: "‎",
                            value: `**\`\`\`ml\n🧊 Account Analytics\`\`\`**                                                                                    `
                        },
                        {
                            name: "‎",
                            value: `There was some error trying to get your analytics... Please try updaging them on your collabs profile command.`,
                            inline: true
                        },
                    )
                }
                joinEmbed.addFields(
                    {
                        name: "‎",
                        value: `**\`\`\`ml\n📀 Participation Data\`\`\`**                                                                                    `
                    },
                    {
                        name: "‎",
                        value: `┌ Pick ID: **${itemInPool.id}**\n├ Name: **${itemInPool.name}**\n└ Series: **${itemInPool.series}**`,
                        inline: true
                    },
                    {
                        name: "‎",
                        value: `┌ Category: **${itemInPool.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                        inline: true
                    },
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    },
                )
                const imageEmbed = new EmbedBuilder()
                    .setImage(itemInPool.imgURL)
                    .setFooter({ text: 'Endless Mirage | Pick Image', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                logChannel.send({ content: `<@${userId}>`, embeds: [joinEmbed, imageEmbed] });

                while (true) {
                    try {
                        await localFunctions.setParticipationOnSheet(collab, itemInPool, userOsuDataFull.username);
                        console.log('Sheet update done!');
                        break;
                    } catch {
                        console.log('Sheet update failed, retring in 2 minutes...');
                        await localFunctions.delay(2 * 60 * 1000);
                    }
                }
            } else {
                collab = await localFunctions.getCollab(initializedMap.get(int.user.id).collab.name, collection);
                const currentPick = collab.pool.items.find((e) => e.id === participation.id);
                await localFunctions.unsetCollabParticipation(collab.name, collection, currentPick.id);
                await localFunctions.setCollabParticipation(collab.name, collection, pick);
                await localFunctions.editCollabParticipantPickOnCollab(collab.name, userId, newPickFull, collection);
                await localFunctions.editCollabParticipantPickOnUser(userId, collab.name, newPickFull, userCollection);

                const swapEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Swap', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setThumbnail(participation.avatar_url)
                    .setDescription(`**\`\`\`ml\n🎫 New Character Swap!\`\`\`**                                                                                    **${collab.name}**`)
                    .addFields(
                        {
                            name: "‎",
                            value: "**\`\`\`ml\n- Picked\`\`\`**",
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Pick ID: **${newPickFull.id}**\n└ Name: **${newPickFull.name}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        },
                        {
                            name: "‎",
                            value: "**\`\`\`js\n+ Available\`\`\`**",
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Pick ID: **${currentPick.id}**\n└ Name: **${currentPick.name}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        },
                    )
                logChannel.send({ content: `<@${userId}>`, embeds: [swapEmbed] });
                await int.editReply(`You've swaped your pick! New pick: ${newPickFull.name}`);
                while (true) {
                    try {
                        await localFunctions.unsetParticipationOnSheet(collab, currentPick);
                        console.log('Parcitipation unset');
                        break;
                    } catch (e) {
                        console.log(e);
                        console.log('Sheet update failed, retring in 2 minutes...');
                        await localFunctions.delay(2 * 60 * 1000);
                    }
                }
                while (true) {
                    try {
                        await localFunctions.setParticipationOnSheet(collab, newPickFull, userOsuDataFull.username);
                        console.log('New pick set!');
                        break;
                    } catch (e) {
                        console.log(e);
                        console.log('Sheet update failed, retring in 2 minutes...');
                        await localFunctions.delay(2 * 60 * 1000);
                    }
                }
            }

        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
            mongoClientSpecial.close();
        }
    }
}