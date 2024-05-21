const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'swap-image'
    },
    async execute (int, client) {
        const modal = new ModalBuilder()
            .setCustomId("swap-image")
            .setTitle(`Change your pick image.`);

        const image = new TextInputBuilder()
            .setCustomId('imageURL')
            .setLabel("Insert a valid image URL.")
            .setPlaceholder("The image has to be transparent and a PNG, with also no cuts at the sides and no background on it.")
            .setStyle(TextInputStyle.Paragraph)

        modal.addComponents(new ActionRowBuilder().addComponents(image));
        await int.showModal(modal); 
    },
};