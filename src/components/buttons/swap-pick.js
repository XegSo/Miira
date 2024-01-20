const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const swapCache = new Map();

module.exports = {
    data: {
        name: 'swap-pick'
    },
    async execute(int, client) {
        const initializedMap = [profileButtonCache, profileMenuCache].find(map => map.size > 0);
        try {
            const collab = initializedMap.get(int.user.id).collab
            if (collab.type === "pooled") {
                if (collab.status === "full") {
                    return await int.editReply('This collab is full! There is no character to swap with');
                }
                const modal = new ModalBuilder()
                    .setCustomId(`swap-pick`)
                    .setTitle(`${collab.name}`);

                const pick = new TextInputBuilder()
                    .setCustomId('pick')
                    .setLabel(`Type the ID of the character to swap.`)
                    .setStyle(TextInputStyle.Short)

                modal.addComponents(new ActionRowBuilder().addComponents(pick));
                swapCache.set(int.user.id, {
                    collab: collab.name,
                })
                await int.showModal(modal);
            }
        } catch (e) {
            console.log(e);
        } 
    },
    swapCache: swapCache
}