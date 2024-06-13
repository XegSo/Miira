const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('../modals/manage-pick-collab');
const { userCheckCache } = require('../../commands/collabs/collabs');


module.exports = {
    data: {
        name: 'edit-fields-user-collab-admin'
    },
    async execute(int, client) {
        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== 'undefined') {
                initializedMap = collabCache;
            }
        }
        if (userCheckCache.size > 0) {
            if (typeof userCheckCache.get(int.user.id) !== 'undefined') {
                initializedMap = userCheckCache;
            }
        }
        const collab = initializedMap.get(int.user.id).collab;
        const participation = initializedMap.get(int.user.id).participation;
        const modal = new ModalBuilder()
            .setCustomId('edit-fields-user-collab-admin')
            .setTitle('Edit the fields of an user in the collab.');

        const av_text = new TextInputBuilder()
            .setCustomId('av_text')
            .setLabel('Type the text for the avatar.')
            .setPlaceholder(participation.av_text)
            .setMinLength(2)
            .setMaxLength(collab.fieldRestrictions.av)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const ca_text = new TextInputBuilder()
            .setCustomId('ca_text')
            .setLabel('Type the text for the card.')
            .setPlaceholder(participation.ca_text)
            .setMinLength(2)
            .setMaxLength(collab.fieldRestrictions.ca)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const ca_quote = new TextInputBuilder()
            .setCustomId('ca_quote')
            .setLabel('Type a quote for the card.')
            .setPlaceholder(participation.ca_quote ? participation.ca_quote : 'None')
            .setMinLength(2)
            .setMaxLength(collab.fieldRestrictions.ca_quote)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const imgURL = new TextInputBuilder()
            .setCustomId('img')
            .setLabel('Replace the image for this user.')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Type a reason')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(av_text), new ActionRowBuilder().addComponents(ca_text), new ActionRowBuilder().addComponents(ca_quote), new ActionRowBuilder().addComponents(imgURL), new ActionRowBuilder().addComponents(reason));

        await int.showModal(modal);
    }
};
