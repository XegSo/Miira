const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const tradeCache = new Map();

module.exports = {
    data: {
        name: 'trade-pick'
    },
    async execute(int, client) {
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
            return await int.reply({ content: `This trade request failed due to cache issues, pleasy try again!`, ephemeral: true });
        } finally {
            mongoClientSpecial.close();
        }
    },
    tradeCache: tradeCache
}