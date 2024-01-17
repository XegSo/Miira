const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { buttonCache } = require('../selectMenus/select-collab');

module.exports = {
    data: {
        name: 'join-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        main: try {
            let userOsuData = await localFunctions.getOsuID(userId, collection);
            if (!userOsuData) {
                components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('link-osu')
                        .setLabel('🔗 Link your osu! Account')
                        .setStyle('Success'),
                )
                int.editReply({
                    content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                    components: [components]
                });
                break main;
            }
        } finally {
            mongoClient.close();
        }
    },
}