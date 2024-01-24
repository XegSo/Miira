const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const yeetCache = new Map();

module.exports = {
    data: {
        name: 'remove-user-collab'
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
            .setCustomId("remove-user-collab")
            .setTitle('Remove an user from the collab');

        const pick = new TextInputBuilder()
            .setCustomId('pick')
            .setLabel('Type the id of the pick')
            .setStyle(TextInputStyle.Short)

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Type a reason')
            .setStyle(TextInputStyle.Short)


        modal.addComponents(new ActionRowBuilder().addComponents(pick), new ActionRowBuilder().addComponents(reason));
        
        yeetCache.set(int.user.id, {
            collab: collab,
        });

        await int.showModal(modal);
    },
    yeetCache: yeetCache
}