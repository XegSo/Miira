const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Lists the shop where you can buy items.')
        .addStringOption(option => 
            option
                .setName('class')
                .setDescription('Select whick kind of items to display')
                .setRequired(true)
                .addChoices(
                { name: 'Augments', value: 'Augments' },
                { name: 'Roles', value: 'Roles' },
                { name: 'Commissions', value: 'Commissions' },
                { name: 'Collab Perks', value: 'Collab Perks' },
                { name: 'Extra', value: 'Extra' },
                //{ name: 'Cosmetics', value: 'Cosmetics' },
                //{ name: 'Instant Goodies', value: 'Instant Goodies' },
                )
        ),
    async execute(int, client) {
        const shopType = int.options.getString('class');
        const shopEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setTitle(`${shopType}`)
            .setFooter({ text: 'Note: Prices and Items on the shop might change at any given time.' });
        for (const item of localConstants.shopItems) {
            if (item.class === shopType) {
                shopEmbed.addFields({ name: `🏷 ${item.name}`, value: `${item.desc}\n **Cost: **${item.value}` });
            }    
        }
        const BuyEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPaDZ/a52c04b267.png')
            .setColor('#f26e6a');
        const options = new SelectMenuBuilder()
            .setCustomId('buy-item')
            .setPlaceholder('Select an item to buy');
        for (const item of localConstants.shopItems) {
            if (item.class === shopType) {
                options.addOptions({ label: item.name, value: item.name, description: item.value });
            }    
        }
        const shopClass = new SelectMenuBuilder()
            .setCustomId('shop-class')
            .setPlaceholder('Switch to another section')
            .addOptions([ 
                { label: 'Augments', value: 'Augments', description: 'Activity augments.' },
                { label: 'Roles', value: 'Roles', description: 'Special Roles.' },
                { label: 'Commissions', value: 'Commissions', description: 'GFX Commissions.' },
                { label: 'Collab Perks', value: 'Collab Perks', description: 'Perks for the megacollabs.' },
                { label: 'Extra', value: 'Extra', description: 'Stuff that doesn\'t fit any category.' },
            ]);
        const actionRowOptions = new ActionRowBuilder().addComponents(options);
        const actionRowShopClass = new ActionRowBuilder().addComponents(shopClass);
        int.reply({
        content: '',
        embeds: [BuyEmbed, shopEmbed],
        components: [actionRowOptions,actionRowShopClass],
        });
    }    
}