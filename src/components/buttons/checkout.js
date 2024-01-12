const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'checkout'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        let totalCost = 0;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const checkoutEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp();    
        try {
            let checkoutItems = await localFunctions.getCart(userId, collection);
            if (checkoutItems.length) {
                checkoutEmbed.setDescription(`**\`\`\`prolog\n💎 Your Payment link is ready!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**\n*At the moment, we only support PayPal and Ko-fi Payments.*`)   
                for (item of checkoutItems) {
                    totalCost = totalCost + item.price;
                }
                await localFunctions.setCurrentPendingPayment(userId, totalCost, collection);
                checkoutEmbed.addFields(
                    {
                        name: `᲼`,
                        value: `**\`\`💳 Amount to pay: ${totalCost}$\`\`**\nOnce the Payment is **completed**, press the **Verify Payment** Button for verification and asignation of your items.`,
                    },
                ) 
                let checkoutComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('💳 PayPal')
                        .setURL(`${localConstants.paypal}${totalCost}`)
                        .setStyle('Link'),   
                    new ButtonBuilder()
                        .setLabel('💳 Ko-Fi')
                        .setURL(`${localConstants.kofi}${totalCost}`)
                        .setStyle('Link'),      
                    new ButtonBuilder()
                        .setCustomId('verify-payment')
                        .setLabel('✅ Verify Payment')
                        .setStyle('Success'),
                )
                int.editReply({
                    content: '',
                    embeds: [checkoutEmbed],
                    components: [checkoutComponents],
                });
            } else {
                int.editReply('Something went wrong...');
            }
        } finally {
            mongoClient.close();
        } 
    }
}