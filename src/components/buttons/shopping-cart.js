const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'shopping-cart'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        let totalCost = 0;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const cartEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setTimestamp();    
        try {
            let cartItems = await localFunctions.getCart(userId, collection);
            if (cartItems.length) {
                let deleteMenu = new SelectMenuBuilder()
                        .setCustomId('delete-cart-items')
                        .setPlaceholder('Remove specific items from the cart.')
                        .setMinValues(1)
                        .setMaxValues(cartItems.length);
                cartEmbed.setDescription(`**\`\`\`prolog\n🛒 Current items in cart᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`)   
                for (item of cartItems) {
                    cartEmbed.addFields(
                        {
                            name: `᲼`,
                            value: `**\`\`🔗 ${item.name}\`\`**\n ├ Type: ${item.type}\n └ Price: ${item.price}$`,
                        },
                    ) 
                    totalCost = totalCost + item.price;
                    deleteMenu.addOptions({ label: item.name, value: item.name, description: `Cost: ${item.price}$` });
                }
                cartEmbed.addFields(
                    {
                        name: `‎`,
                        value: `**\`\`\`ml\n᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼💳 Total cost: ${totalCost}$\`\`\`**`,
                    },
                ) 
                const deleteComponent = new ActionRowBuilder().addComponents(deleteMenu);
                let cartComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('checkout')
                        .setLabel('💵 Checkout')
                        .setStyle('Success'),    
                    new ButtonBuilder()
                        .setCustomId('empty-cart')
                        .setLabel('🚮 Empty cart')
                        .setStyle('Danger'),
                )
                int.editReply({
                    content: '',
                    embeds: [cartEmbed],
                    components: [cartComponents, deleteComponent],
                });
            } else {
                cartEmbed.setDescription(`**\`\`\`ml\n🛒 Your cart is empty!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`) 
                int.editReply({
                    content: '',
                    embeds: [cartEmbed],
                });
            }
        } finally {
            mongoClient.close();
        } 
    }
}