const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { joinCache } = require('../buttons/join-collab');
const { buttonCache } = require('../selectMenus/select-collab');

module.exports = {
    data: {
        name: "join-collab"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        buttonCache.delete(int.user.id);
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection: collabsCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            let collab = await localFunctions.getCollab(joinCache.get(int.user.id).collab, collection);
            let userOsuData = joinCache.get(int.user.id).osuData
            if (!userOsuData) {
                const components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('link-osu')
                        .setLabel('🔗 Link your osu! Account')
                        .setStyle('Success'),
                )
                return int.editReply({
                    content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                    components: [components]
                });
            }
            let referral = int.fields.getTextInputValue('referral').length ? int.fields.getTextInputValue('referral') : false;
            let inviter;
            if (referral) {
                inviter = await localFunctions.getInviter(referral, userCollection);
                if (inviter) {
                    if (inviter._id === userId) return int.editReply('You cannot use your own referral code silly!');
                } else {
                    referral = false;
                }
            }
            let userCollabData = joinCache.get(int.user.id).userCollabData;
            let allCollabs = await localFunctions.getCollabs(collabsCollection);
            let verificationCollabs = allCollabs.find(e => e.status === "open" || e.status === "full" || e.status === "delivered" || e.status === "early access" || e.status === "closed");
            verificationCollabs = verificationCollabs || [];
            try {
                if (typeof userCollabData.find(e => verificationCollabs.find(c => c.name === e.name)) !== "undefined") {
                    return int.editReply('You are already participating in an active collab!');
                }
            } catch { }
            if (typeof userCollabData.find(e => e.collabName === collab.name) !== "undefined") {
                return int.editReply({
                    content: 'You are already participating in this collab. To edit your data, manage your participation in your collabs profile.',
                });
            }
            if (collab.type === "pooled") {
                let participants = collab ? collab.participants || [] : [];
                let pool = collab.pool.items;
                let digits = pool[0].id.length;
                const pick = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
                const currentDate = Math.floor(new Date().getTime() / 1000);
                let userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                let itemInPool = pool.find((e) => e.id === pick);
                if (typeof userCollabs.find(e => e.name === collab.name) !== "undefined") {
                    return int.editReply('You are already participating in this collab!');
                }
                if (typeof itemInPool === "undefined") {
                    return int.editReply('Invalid character ID!');
                }

                if (typeof collab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                    if (typeof collab.lockSystem.current === "undefined") { /*System startup from first pick*/
                        const current = {
                            participations: 0,
                            time: 0,
                            lastParticipant: 0
                        }
                        collab.lockSystem.current = current;
                        console.log('Starting up lock system...');
                        await localFunctions.setLockSystem(collab.name, collab.lockSystem, collabsCollection);
                    } else { /*Allows or denys the entry*/
                        if (collab.lockSystem.current.participations >= collab.lockSystem.users && currentDate < (collab.lockSystem.current.time + collab.lockSystem.timeout * 60)) {
                            console.log('Attempt to join the collab while locked!');
                            return int.editReply(`The collab is currently locked to prevent ratelimit! Please try to join again <t:${collab.lockSystem.current.time + collab.lockSystem.timeout * 60}:R>`);
                        }
                        if (((currentDate > (collab.lockSystem.current.lastParticipant + 120)) || (currentDate + collab.lockSystem.timeout * 60) >= collab.lockSystem.current.time) && collab.lockSystem.current.time !== 0) { /*Reset the system if over 2m have passed and no one has joined, or if the timeout has passed*/
                            const current = {
                                participations: 0,
                                time: 0
                            }
                            collab.lockSystem.current = current;
                            await localFunctions.setLockSystem(collab.name, collab.lockSystem, collabsCollection);
                            console.log('Resetting lock system...');
                        }
                    }
                }

                collab = await localFunctions.getCollab(joinCache.get(int.user.id).collab, collection);
                itemInPool = await collab.pool.items.find((e) => e.id === pick);

                if (itemInPool.status === "picked") {
                    return int.editReply('This character has been picked already by someone else!');
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
                    prestigeLevel = parseInt(prestige.replace('Prestige ', ''));
                }
                const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
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
                    bump_imune: tier ? true : false,
                    referral: referral ? referral: false,
                    collabName: collab.name,
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
                    av_text: int.fields.getTextInputValue('av_text'),
                    ca_text: int.fields.getTextInputValue('ca_text'),
                    ca_quote: int.fields.getTextInputValue('ca_quote').length ? int.fields.getTextInputValue('ca_quote') : "",
                    prestige: prestigeLevel,
                    tier: tier
                }

                userCollabs.push(profileData);
                await localFunctions.setUserCollabs(userId, userCollabs, userCollection);
                await int.editReply(`You've joined the collab succesfully! Pick: ${itemInPool.name}\nYour participation should appear on the spreadsheet shortly. Use the command \`\`/collabs manage\`\` to manage your participation!`);

                const joinEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Collab Participant', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setThumbnail(userOsuDataFull.avatar_url)
                    .setAuthor({ name: `New Participation on the ${collab.name}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setDescription(`**\`\`\`ml\n🎫 osu! Info\`\`\`**                                                                                    `)
                    .addFields(
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
                    }
                )
                if (referral) {
                    joinEmbed.addFields(
                        {
                            name: "‎",
                            value: `Referred by <@${inviter._id}>`
                        }
                    )
                }
                joinEmbed.addFields(
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    }
                )
                const imageEmbed = new EmbedBuilder()
                    .setImage(itemInPool.imgURL)
                    .setFooter({ text: 'Endless Mirage | Pick Image', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                logChannel.send({ content: `<@${userId}>`, embeds: [joinEmbed, imageEmbed] });
                if (typeof collab.lockSystem !== "undefined") { /*Prevents ratelimit*/
                    collab.lockSystem.current.participations = collab.lockSystem.current.participations + 1;
                    collab.lockSystem.current.lastParticipant = Math.floor(new Date().getTime() / 1000);
                    if (collab.lockSystem.current.participations === collab.lockSystem.users) {
                        collab.lockSystem.current.time = Math.floor(new Date().getTime() / 1000);
                        console.log('Locking the collab...');
                    }
                    await localFunctions.setLockSystem(collab.name, collab.lockSystem, collabsCollection);
                }

                while (true) {
                    try {
                        await localFunctions.setParticipationOnSheet(collab, itemInPool, userOsuDataFull.username);
                        console.log('Sheet update done!');
                        break;
                    } catch {
                        console.log('Sheet update failed, retring in 2 minutes...');
                        await localFunctions.delay(2*60*1000);
                    }
                }

                await guildMember.roles.add(collab.roleId);
            }
        } catch (e) {
            console.log(e);
            await int.editReply('Your pick has been locked but there has been an error while joining the collab. Please ping the owner in the support channel!');
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
            mongoClientCollabs.close();
            joinCache.delete(userId);
        }
    },
};