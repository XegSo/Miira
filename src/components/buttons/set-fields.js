const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { collabCache } = require('./admin-collab');

module.exports = {
    data: {
        name: 'set-fields'
    },
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        let collab = collabCache.get(int.user.id).collab;
        const modal = new ModalBuilder()
            .setCustomId(`set-fields`)
            .setTitle(`${collab}`);

        const av_text = new TextInputBuilder()
            .setCustomId('av_text')
            .setLabel('Character limit for the avatar.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const ca_text = new TextInputBuilder()
            .setCustomId('ca_text')
            .setLabel('Character limit for the card.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        const ca_quote = new TextInputBuilder()
            .setCustomId('ca_quote')
            .setLabel('Character limit for the card quote.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
         
        modal.addComponents(new ActionRowBuilder().addComponents(av_text), new ActionRowBuilder().addComponents(ca_text), new ActionRowBuilder().addComponents(ca_quote));    

        await int.showModal(modal);
    },
    collabCache: collabCache
};