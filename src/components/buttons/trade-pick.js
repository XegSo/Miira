const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const tradeCache = new Map();

module.exports = {
    data: {
        name: 'trade-pick'
    },
    async execute(int, client) {
        const initializedMap = [profileButtonCache, profileMenuCache].find(map => map.size > 0);
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB('Special');
        try {
            const existingTradeRequest = await localFunctions.getTradeRequest(int.user.id, collectionSpecial);
            if (existingTradeRequest.length !== 0) {
                return await int.reply({ content: `You cannot request a trade when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            const collab = initializedMap.get(int.user.id).collab
            if (collab.type === "pooled") {
                const modal = new ModalBuilder()
                    .setCustomId("trade-pick")
                    .setTitle(`${collab.name}`);

                const pick = new TextInputBuilder()
                    .setCustomId('pick')
                    .setLabel("Type the ID of the character to trade.")
                    .setStyle(TextInputStyle.Short)

                modal.addComponents(new ActionRowBuilder().addComponents(pick));
                tradeCache.set(int.user.id, {
                    collab: collab,
                })
                await int.showModal(modal);
            }
        } catch (e) {
            console.log(e);
        } finally {
            mongoClientSpecial.close();
        }
    },
    tradeCache: tradeCache
}