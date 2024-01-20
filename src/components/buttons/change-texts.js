const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const editCache = new Map();

module.exports = {
    data: {
        name: 'change-texts'
    },
    async execute(int, client) {
        const initializedMap = [profileButtonCache, profileMenuCache].find(map => map.size > 0);
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        try {
            const collab = initializedMap.get(int.user.id).collab;
            const modal = new ModalBuilder()
                .setCustomId(`change-texts`)
                .setTitle(`${collab.name}`);
            const av_text = new TextInputBuilder()
                .setCustomId('av_text')
                .setLabel('Type the text for the avatar.')
                .setPlaceholder('Tipically your username.')
                .setMinLength(2)
                .setMaxLength(collab.fieldRestrictions.av)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const ca_text = new TextInputBuilder()
                .setCustomId('ca_text')
                .setLabel('Type the text for the card.')
                .setPlaceholder('Tipically your username.')
                .setMinLength(2)
                .setMaxLength(collab.fieldRestrictions.ca)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const ca_quote = new TextInputBuilder()
                .setCustomId('ca_quote')
                .setLabel('Type a quote for the card.')
                .setPlaceholder('Optional.')
                .setMinLength(2)
                .setMaxLength(collab.fieldRestrictions.ca_quote)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(new ActionRowBuilder().addComponents(av_text), new ActionRowBuilder().addComponents(ca_text), new ActionRowBuilder().addComponents(ca_quote));

            await int.showModal(modal);

            editCache.set(int.user.id, {
                collab: collab.name,
            });

        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
        }
    },
    editCache: editCache
}