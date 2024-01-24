const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { buttonCache } = require('../buttons/join-collab');

module.exports = {
    data: {
        name: `join-collab`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const collab = await localFunctions.getCollab(buttonCache.get(int.user.id).collab, collection);
            if (collab.type === "pooled") {
                let participants = collab ? collab.participants || [] : [];
                let pool = collab.pool.items;
                let digits = pool[0].id.length;
                const pick = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
                let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                const itemInPool = pool.find((e) => e.id === pick);
                if (typeof userCollabs.find(e => e.name === collab.name) !== "undefined") {
                    return await int.editReply('You are already participating in this collab!');
                }
                if (typeof itemInPool === "undefined") {
                    return await int.editReply('Invalid character ID!');
                }
                if (itemInPool.status === "picked") {
                    return await int.editReply('This character has been picked already by someone else!');
                }
                await localFunctions.setCollabParticipation(collab.name, collection, pick);
                let prestigeLevel = 0;
                let tier = 0;
                let prestige = guildMember.roles.cache.find(role => localConstants.prestigeRolesIDs.includes(role.id));
                if (guildMember.roles.cache.has('743505566617436301')) {
                    const userTier = await localFunctions.getUserTier(userId, userCollection);
                    if (userTier.length === 0 && !guildMember.roles.cache.has('1150484454071091280')) {
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
                const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
                const currentDate = Math.floor(new Date().getTime() / 1000);
                let userOsuData = localFunctions.flattenObject(userOsuDataFull);
                const userParticipant = {
                    discordId: userId,
                    discordTag: int.user.tag,
                    joinDate: currentDate,
                    av_text: int.fields.getTextInputValue('av_text'),
                    ca_text: int.fields.getTextInputValue('ca_text'),
                    ca_quote: int.fields.getTextInputValue('ca_quote').length ? int.fields.getTextInputValue('ca_quote') : "",
                    prestige: prestigeLevel,
                    tier: tier,
                    bump_imune: tier ? true : false
                };
                await localFunctions.setParticipationOnSheet(collab, itemInPool, userOsuDataFull.username);
                delete itemInPool.status;
                delete itemInPool.sheetIndex;
                delete itemInPool.coordinate;
                delete itemInPool.localId;
                const data = { ...userParticipant, ...itemInPool, ...userOsuData };
                await localFunctions.addCollabParticipant(collab.name, collection, data);
                if ((participants.length + 1) === collab.user_cap) {
                    await localFunctions.setCollabStatus(collab.name, "full", collection);
                }
                const profileData = {
                    collabName: collab.name,
                    collabPick: itemInPool,
                    joinDate: currentDate,
                    av_text: int.fields.getTextInputValue('av_text'),
                    ca_text: int.fields.getTextInputValue('ca_text'),
                    ca_quote: int.fields.getTextInputValue('ca_quote').length ? int.fields.getTextInputValue('ca_quote') : "",
                    prestige: prestigeLevel,
                    tier: tier
                }

                userCollabs.push(profileData);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);

                const joinEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setThumbnail(userOsuDataFull.avatar_url)
                    .setDescription(`**\`\`\`ml\n🎫 New Collab Participation!\`\`\`**                                                                                    **${collab.name}**`)
                    .addFields(
                        {
                            name: `osu! info`,
                            value: `┌ User: **${userOsuDataFull.username}**\n├ Country: **${userOsuDataFull.country_code}**\n├ Rank: **#${userOsuDataFull.statistics.global_rank}**\n├ Peak: **#${userOsuDataFull.rank_highest.rank}**\n└ Mode: **${userOsuDataFull.playmode}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `┌ PP: **${userOsuDataFull.statistics.pp}pp**\n├ Level: **${userOsuDataFull.statistics.level.current}**\n├ Playcount: **${userOsuDataFull.statistics.play_count}**\n├ Playtime: **${Math.floor(userOsuDataFull.statistics.play_time / 3600)}h **\n└ Followers: **${userOsuDataFull.follower_count}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        },
                        {
                            name: `Analytics`,
                            value: `┌ ACC: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[0].int : "..."}**\n├ REA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[1].int : "..."}**\n├ AIM: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[2].int : "..."}**\n├ SPD: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[3].int : "..."}**\n├ STA: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[4].int : "..."}**\n└ PRE: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].rank : "..."}** | Score: **${userOsuDataFull.skillRanks ? userOsuDataFull.skillRanks[5].int : "..."}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `┌ Top 1 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[0].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[0].percentage) : "..."}%**\n├ Top 2 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[1].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[1].percentage) : "..."}%**\n├ Top 3 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[2].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[2].percentage) : "..."}%**\n├ Top 4 Mod: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.top4Mods[3].mod : "..."}** | **${userOsuDataFull.modsData ? Math.round(userOsuDataFull.modsData.top4Mods[3].percentage) : "..."}%**\n└ Combination: **${userOsuDataFull.modsData ? userOsuDataFull.modsData.mostCommonModCombination.combination : "..."}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        },
                        {
                            name: `General info`,
                            value: `┌ Pick ID: **${itemInPool.id}**\n├ Name: **${itemInPool.name}**\n└ Series: **${itemInPool.series}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `┌ Category: **${itemInPool.category}**\n├ Premium Tier: **${tier}**\n└ Prestige Level: **${prestigeLevel}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        },
                    )
                const imageEmbed = new EmbedBuilder()
                    .setImage(itemInPool.imgURL)
                    .setFooter({ text: 'Endless Mirage | Pick Image', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                logChannel.send({ content: `<@${userId}>`, embeds: [joinEmbed, imageEmbed] });
                await int.editReply(`You've joined the collab! Pick: ${itemInPool.name}`);
            }
        } catch (e) {
            console.log(e);
            await int.editReply(`An error has ocurred but the pick has been locked for you. Please retry the process, and if you encounter with any issue contact the owner <@687004886922952755>`);
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};