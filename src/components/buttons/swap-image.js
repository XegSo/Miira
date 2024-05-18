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
            .setStyle(TextInputStyle.Short)

        modal.addComponents(new ActionRowBuilder().addComponents(image));
        await int.showModal(modal); 
    },
};