const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const editCache = new Map();

module.exports = {
    data: {
        name: 'edit-collab'
    },
    async execute(int, client) {
        if (collabCache.size === 0) {
            int.reply('Open the dashboard again. The collab hasn\'t been cached');
            return;
        }
        const collabName = collabCache.get(int.user.id).collab
        const modal = new ModalBuilder()
            .setCustomId(`edit-collab`)
            .setTitle('Edit the collab info');

        const title = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Change the collab name.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const topic = new TextInputBuilder()
            .setCustomId('topic')
            .setLabel('Change the collab topic.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const status = new TextInputBuilder()
            .setCustomId('status')
            .setLabel('Change the collab status.')
            .setPlaceholder('closed | open | on design | early access | full | delivered | completed')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const opening = new TextInputBuilder()
            .setCustomId('opening')
            .setLabel('Change the collab opening date in UNIX epoch.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const user_cap = new TextInputBuilder()
            .setCustomId('user_cap')
            .setLabel('Change the collab user cap.')
            .setPlaceholder('0 = unlimited.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(title), new ActionRowBuilder().addComponents(topic), new ActionRowBuilder().addComponents(status), new ActionRowBuilder().addComponents(opening), new ActionRowBuilder().addComponents(user_cap));
        
        editCache.set(int.user.id, {
            collab: collabName,
        });

        await int.showModal(modal);
    },
    editCache: editCache
}