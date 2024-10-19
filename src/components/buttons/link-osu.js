const localFunctions = require('../../functions');
const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'link-osu'
    },
    async execute(int, client) {
        const premiumEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setDescription('**```ml\n 🚀 This action is no longer in service.```**')

        await int.editReply({
            content: '',
            embeds: [premiumEmbed],
        });
    }
};
