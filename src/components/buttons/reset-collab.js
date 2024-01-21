const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const resetCache = new Map();

module.exports = {
    data: {
        name: 'reset-collab'
    },
    async execute(int, client) {
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const collab = await localFunctions.getCollab(collabCache.get(int.user.id).collab, collection);
        if (collab.host !== int.user.id) {
            int.reply('You are not allowed to do this.');
            return;
        }
        if (collabCache.size === 0) {
            int.reply('Open the dashboard again. The collab hasn\'t been cached');
            return;
        }
        const modal = new ModalBuilder()
            .setCustomId(`reset-collab`)
            .setTitle('Collab user reset');

        const title = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Type the name of the collab to reset it')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);


        modal.addComponents(new ActionRowBuilder().addComponents(title));
        
        resetCache.set(int.user.id, {
            collab: collab,
        });

        await int.showModal(modal);
    },
    resetCache: resetCache
}