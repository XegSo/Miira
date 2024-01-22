const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const { connectToSpreadsheet } = require('../../googleSheets');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { tools } = require('osu-api-extended');
const { swapCache } = require('../buttons/swap-pick');

module.exports = {
    data: {
        name: `swap-pick`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        try {
            const collab = await localFunctions.getCollab(swapCache.get(int.user.id).collab, collection);
            if (collab.type === "pooled") {
                if (collab.status === "full") {
                    return await int.editReply('This collab is full! There is no character to swap with');
                }
                let pool = collab.pool.items;
                let digits = pool[0].id.length;
                const pick = localFunctions.padNumberWithZeros(parseInt(int.fields.getTextInputValue('pick')), digits);
                const userCollabs = await localFunctions.getUserCollabs(userId, userCollection);
                const userCollab = userCollabs.find(e => e.collabName === collab.name);
                const currentPick = pool.find((e) => e.id === userCollab.collabPick.id);
                const newPickFull = pool.find((e) => e.id === pick);
                if (typeof newPickFull === "undefined") {
                    return await int.editReply('Invalid character ID!');
                }
                if (newPickFull.status === "picked") {
                    return await int.editReply('This character has already been picked!');
                }
                const userOsuDataFull = await localFunctions.getOsuData(userId, userCollection);
                await localFunctions.unsetCollabParticipation(collab.name, collection, currentPick.id);
                await localFunctions.setCollabParticipation(collab.name, collection, pick);
                await localFunctions.editCollabParticipantPickOnCollab(collab.name, userId, newPickFull, collection);
                await localFunctions.editCollabParticipantPickOnUser(userId, collab.name, newPickFull, userCollection);
                await localFunctions.unsetParticipationOnSheet(collab, currentPick);
                await localFunctions.setParticipationOnSheet(collab, newPickFull, userOsuDataFull.username);


                const swapEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | New Character Swap', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setThumbnail(userOsuDataFull.avatar_url)
                    .setDescription(`**\`\`\`ml\n🎫 New Character Swap!\`\`\`**                                                                                    **${collab.name}**`)
                    .addFields(
                        {
                            name: `‎`,
                            value: `**\`\`\`ml\n- Picked\`\`\`**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `┌ Pick ID: **${newPickFull.id}**\n└ Name: **${newPickFull.name}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        },
                        {
                            name: `‎`,
                            value: `**\`\`\`js\n+ Available\`\`\`**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `┌ Pick ID: **${currentPick.id}**\n└ Name: **${currentPick.name}**`,
                            inline: true
                        },
                        {
                            name: `‎`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        },
                    )
                logChannel.send({ content: `<@${userId}>`, embeds: [swapEmbed] });
                await int.editReply(`You've swaped your pick! New pick: ${newPickFull.name}`);
            }
        } catch (e) {
            console.log(e);
        } finally {
            swapCache.delete(int.user.id);
            mongoClient.close();
            mongoClientUsers.close();
        }
    },
};