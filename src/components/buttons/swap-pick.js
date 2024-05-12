const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder,  ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const swapCache = new Map();

module.exports = {
    data: {
        name: 'swap-pick'
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
                return await int.reply({ content: `You cannot swap your pick when you have an active trade request. ${existingTradeRequest.messageUrl}`, ephemeral: true });
            }
            const collab = initializedMap.get(int.user.id).collab
            if (collab.type === "pooled") {
                if (collab.status === "full") {
                    return await int.reply({ content: 'This collab is full! There is no character to swap with', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId("swap-pick")
                    .setTitle(`${collab.name}`);

                const pick = new TextInputBuilder()
                    .setCustomId('pick')
                    .setLabel("Type the ID of the character to swap.")
                    .setStyle(TextInputStyle.Short)

                modal.addComponents(new ActionRowBuilder().addComponents(pick));
                swapCache.set(int.user.id, {
                    collab: collab.name,
                })
                await int.showModal(modal);
            }
        } catch (e) {
            console.log(e);
        } finally {
            mongoClientSpecial.close();
        }
    },
    swapCache: swapCache
}