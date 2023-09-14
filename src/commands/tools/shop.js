const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Lists the shop where you can buy items.'),
    async execute(int, client) {
        const shopEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setFooter({ text: 'Note: Prices and Items on the shop might change at any given time.' });
        for (const item of localConstants.shopItems) {
            shopEmbed.addFields({ name: `🏷 ${item.name}`, value: `${item.desc}\n **Cost: **${item.value}` });
        }
        const BuyEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPaDZ/a52c04b267.png')
            .setColor('#f26e6a');
        const options = [
        new SelectMenuBuilder()
            .setCustomId('buy-item')
            .setPlaceholder('Select an item to buy')
            .addOptions(
                localConstants.shopItems.map((item) => ({
                label: item.name,
                value: item.name,
                description: item.value,
            }))
            ),
        ];
        const actionRow = new ActionRowBuilder().addComponents(options);
        int.reply({
        content: '',
        embeds: [BuyEmbed, shopEmbed],
        components: [actionRow],
        ephemeral: true
        });
    }    
}