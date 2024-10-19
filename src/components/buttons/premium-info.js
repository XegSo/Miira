const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'premium-info'
    },
    async execute(int) {
        await int.deferReply({ ephemeral: true });

        const premiumEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setDescription('**```ml\n 🚀 This section is no longer in service.```**')
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' });


        await int.editReply({
            content: '',
            embeds: [premiumEmbed],
        });

    }
};
