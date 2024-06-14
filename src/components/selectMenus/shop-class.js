const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'shop-class'
    },
    async execute(int) {
        await int.deferReply({ ephemeral: true });
        const shopType = int.values[0];
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
                { label: 'Extra', value: 'Extra', description: 'Stuff that doesn\'t fit any category.' }
            ]);
        const actionRowOptions = new ActionRowBuilder().addComponents(options);
        const actionRowShopClass = new ActionRowBuilder().addComponents(shopClass);

        int.message.edit({
            content: '',
            embeds: [BuyEmbed, shopEmbed],
            components: [actionRowOptions, actionRowShopClass]
        });

        int.editReply(`You're now on the ${shopType} section`);
    }
};
