const localFunctions = require('../../functions');
const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'link-osu'
    },
    async execute(int, client) {
        const userId = int.user.id;
        const collection = client.db.collection('OzenCollection');
        let userOsuData = await localFunctions.getOsuData(userId, collection);

        if (userOsuData) {
            await int.reply({ content: 'You already have your osu! account linked!', ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('fetch-profile')
            .setTitle('Link your osu! account');

        const name = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Type your osu! name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const mode = new TextInputBuilder()
            .setCustomId('mode')
            .setLabel('Type your main gamemode')
            .setPlaceholder('osu | fruits | mania | taiko')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(name), new ActionRowBuilder().addComponents(mode));

        await int.showModal(modal);
    }
};
