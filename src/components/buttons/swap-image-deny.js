const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const ImageRequestCache = new Map();

module.exports = {
    data: {
        name: 'swap-image-deny'
    },
    async execute(int, client) {
        const request = await localFunctions.getImageRequestByMessage(client, int.message.id);

        const modal = new ModalBuilder()
            .setCustomId('swap-image-deny')
            .setTitle('Image Request Denial');

        const textInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Insert the reason for denial.')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);


        modal.addComponents(new ActionRowBuilder().addComponents(textInput));
        await int.showModal(modal);

        ImageRequestCache.set(int.user.id, {
            request: request,
            message: int.message
        });

    },
    ImageRequestCache: ImageRequestCache
};
