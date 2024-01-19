const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'link-osu'
    },
    async execute(int, client) {
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        main: try {
            let userOsuData = await localFunctions.getOsuData(userId, collection);
            if (userOsuData) {
                int.reply({content: 'You already have your osu! account linked!', ephemeral: true});
                break main;
            }
            const modal = new ModalBuilder()
                .setCustomId(`fetch-profile`)
                .setTitle('Link your osu! account');

            const name = new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Type your osu! name')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
            
            const mode = new TextInputBuilder()
                .setCustomId('mode')
                .setLabel('Type your main gamemode')
                .setPlaceholder('osu | fruits | mania | taiko')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);    

            modal.addComponents(new ActionRowBuilder().addComponents(name), new ActionRowBuilder().addComponents(mode));

            await int.showModal(modal);

        } finally {
            mongoClient.close();
        }
    },
}