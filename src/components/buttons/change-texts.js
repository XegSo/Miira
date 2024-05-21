const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { profileButtonCache } = require('./profile-pick');
const { profileMenuCache } = require('../selectMenus/manage-collab');
const editCache = new Map();

module.exports = {
    data: {
        name: 'change-texts'
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
        try {
            const collab = initializedMap.get(int.user.id).collab;
            const modal = new ModalBuilder()
                .setCustomId("change-texts")
                .setTitle(`${collab.name}`);
            const av_text = new TextInputBuilder()
                .setCustomId('av_text')
                .setLabel('Type the text for the avatar.')
                .setPlaceholder('Typically your username.')
                .setMinLength(2)
                .setMaxLength(collab.fieldRestrictions.av)
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const ca_text = new TextInputBuilder()
                .setCustomId('ca_text')
                .setLabel('Type the text for the card.')
                .setPlaceholder('Typically your username.')
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

        }
    },
    editCache: editCache
}