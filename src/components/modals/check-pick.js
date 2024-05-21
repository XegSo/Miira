const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('../buttons/profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const claimCache = new Map();

module.exports = {
    data: {
        name: "check-pick"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        let initializedMap;
        if (profileMenuCache.size > 0) {
            if (typeof profileMenuCache.get(int.user.id).collab !== "undefined") {
                initializedMap = profileMenuCache;
            }
        }
        if (profileButtonCache.size > 0) {
            if (typeof profileButtonCache.get(int.user.id).collab !== "undefined") {
                initializedMap = profileButtonCache;
            }
        }
        try {
            let collab = initializedMap.get(int.user.id).collab
            collab = await localFunctions.getCollab(collab.name, collection);
            let digits = collab.pool.items[0].id.length;
            const typedPick = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
            const pick = collab.pool.items.find((e) => e.id === typedPick);
            if (typeof pick === "undefined") {
                return await int.editReply('Invalid character ID!');
            }
            if (pick.status === "picked") {
                const pickOwner = collab.participants.find(u => parseInt(u.id) === parseInt(pick.id));
                const pickEmbed = new EmbedBuilder()
                    .setFooter({ text: "Endless Mirage | Megacollab Picks", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setDescription(`**\`\`\`\n🏐 ${collab.name}\`\`\`**\n**Picked by: <@${pickOwner.discordId}>**\n**Joined <t:${pickOwner.joinDate}:R>**`)
                    .addFields(
                        {
                            name: "‎",
                            value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                        },
                        {
                            name: "‎",
                            value: `┌ Avatar Text: **${pickOwner.av_text}**\n├ Card Text: **${pickOwner.ca_text}**\n└ Card Quote: **${pickOwner.ca_quote ? pickOwner.ca_quote : "None"}**`,
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                        },
                    )

                const embed2 = new EmbedBuilder()
                    .setImage(pick.imgURL)
                    .setURL('https://endlessmirage.net/')

                await int.editReply({
                    content: '',
                    embeds: [pickEmbed, embed2],
                });
            } else {
                const pickEmbed = new EmbedBuilder()
                    .setFooter({ text: "Endless Mirage | Megacollab Picks", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setURL('https://endlessmirage.net/')
                    .setDescription(`**\`\`\`\n🏐 ${collab.name}\`\`\`**\n**This character hasn't been picked yet!**`)
                    .addFields(
                        {
                            name: "‎",
                            value: `┌ Pick: ${pick.name}\n└ ID: ${pick.id}`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Series: ${pick.series}\n└ Category: ${pick.category}`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:19:1195441100350034063><:21:1195441102585606144><:23:1195440971886903356><:25:1195441155664527410><:27:1195440974978093147>",
                        },
                    )

                const embed2 = new EmbedBuilder()
                    .setImage(pick.imgURL)
                    .setURL('https://endlessmirage.net/')
                
                const components = new ActionRowBuilder();

                components.addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim-pick')
                        .setLabel('🔑 Claim')
                        .setStyle('Success'),
                )

                claimCache.set(int.user.id, {
                    collab: collab,
                    pick: pick
                })

                await int.editReply({
                    content: '',
                    embeds: [pickEmbed, embed2],
                    components: [components]
                });
            }

        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
        }
    },
    claimCache: claimCache
};