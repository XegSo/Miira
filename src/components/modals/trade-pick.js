const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('../buttons/profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');

module.exports = {
    data: {
        name: "trade-pick"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        let initializedMap;
        if (profileMenuCache.size > 0) {
            if (typeof profileMenuCache.get(int.user.id) !== "undefined") {
                initializedMap = profileMenuCache;
            }
        }
        if (profileButtonCache.size > 0) {
            if (typeof profileButtonCache.get(int.user.id) !== "undefined") {
                initializedMap = profileButtonCache;
            }
        }
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.editReply({ content: `You cannot request a trade when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            const collab = initializedMap.get(int.user.id).collab;
            if (collab.type === "pooled") {
                switch (collab.status) {
                    case 'closed':
                    case 'delivered':
                    case 'early delivery':
                    case 'completed':
                    case 'archived':
                        return int.editReply('You cannot trade your character at this collab state.');
                }
                let pool = collab.pool.items;
                let digits = pool[0].id.length;
                const pickRequested = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
                const statusOfRequestedPick = pool.find((e) => e.id === pickRequested);
                if (typeof statusOfRequestedPick === "undefined") {
                    return int.editReply('Invalid character ID!');
                }
                if (statusOfRequestedPick.status === "available") {
                    return int.editReply('This character is available! You can swap your pick without trading.');
                }

                let participants = collab.participants;
                const fullTraderParticipation = participants.find((e) => e.discordId === userId);
                if (fullTraderParticipation.id === pickRequested) {
                    return int.editReply('You cannot trade to yourself silly!');
                }

                const fullRequestedParticipation = participants.find((e) => e.id === pickRequested);


                const swapEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Trade Request', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n🎫 Trade request\`\`\`**                                                                                                        **${collab.name}**`)
                    .addFields(
                        {
                            name: "‎",
                            value: "**\`\`\`ml\n- You give\`\`\`**",
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Pick ID: **${fullRequestedParticipation.id}**\n└ Name: **${fullRequestedParticipation.name}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        },
                        {
                            name: "‎",
                            value: "**\`\`\`js\n+ You receive\`\`\`**",
                            inline: true
                        },
                        {
                            name: "‎",
                            value: `┌ Pick ID: **${fullTraderParticipation.id}**\n└ Name: **${fullTraderParticipation.name}**`,
                            inline: true
                        },
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )

                const components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('accept-trade')
                        .setLabel('Accept')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('reject-trade')
                        .setLabel('Reject')
                        .setStyle('Danger'),
                );

                const message = await logChannel.send({ content: `<@${fullRequestedParticipation.discordId}>`, embeds: [swapEmbed], components: [components] });

                let tradeData = {
                    'requestedUser': fullRequestedParticipation,
                    'traderUser': fullTraderParticipation,
                    'messageId': message.id,
                    'messageUrl': message.url,
                    'collabName': collab.name
                }

                await localFunctions.updateTradeRequest(tradeData, collectionSpecial);

                await int.editReply(`New trade request created in <#${localConstants.logChannelID}>`);
            }
        } catch (e) {
            console.log(e);
        } finally {
            mongoClientSpecial.close();
        }
    },
};