const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const { reportCache } = require('../buttons/report-accept');

module.exports = {
    data: {
        name: 'edit-fields-report'
    },
    async execute(int, client) {
        const collection = client.db.collection('Collabs');
        const collab = await localFunctions.getCollab(reportCache.get(int.user.id).report.collab, collection);

        const modal = new ModalBuilder()
            .setCustomId('edit-fields-report')
            .setTitle('Edit the fields of an user in the collab.');

        const av_text = new TextInputBuilder()
            .setCustomId('av_text')
            .setLabel('Type the text for the avatar.')
            .setMinLength(2)
            .setMaxLength(collab.fieldRestrictions.av)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const ca_text = new TextInputBuilder()
            .setCustomId('ca_text')
            .setLabel('Type the text for the card.')
            .setMinLength(2)
            .setMaxLength(collab.fieldRestrictions.ca)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const ca_quote = new TextInputBuilder()
            .setCustomId('ca_quote')
            .setLabel('Type a quote for the card.')
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
