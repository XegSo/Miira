const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'premium-renew'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;

        mainProcess: try {
            let newCart = [];
            let addedToCartEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')  
            let contentString = "";
            let userTier = await localFunctions.getUserTier(userId, collection);
            let fullPerksForTier = await localFunctions.getFullPerksOfTier(localFunctions.premiumToInteger(userTier.name));
            let fullTier = localConstants.premiumTiers.find((e) => e.name === userTier.name);
            let renewalPerks = await localFunctions.getFullPerksOfTier(localFunctions.premiumToInteger(userTier.name));
            let cartItems = await localFunctions.getCart(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            console.log(`Current Cart: ${cartItems}`);
            newCart = cartItems;

            if (cartItems.length) {
                for (let item of cartItems) {
                    switch (item.type) {
                        case 'Upgrade':
                            await int.editReply("You cannot add a tier renewal while having a tier upgrade in your cart.");
                            break mainProcess;
                        case 'Perk':
                            if (typeof renewalPerks.find((e) => e.name === item.name) !== "undefined") {
                                await int.editReply("You cannot add a tier renewal while having a perk that the renewal includes in your cart.");
                                break mainProcess;
                            }
                            break;
                        case 'Renewal':
                            if (item.class === 'Perk') {
                                if (typeof renewalPerks.find((e) => e.name === item.name) !== "undefined") {
                                    await int.editReply("You cannot add a tier renewal while having a perk that the renewal includes in your cart.");
                                    break mainProcess;
                                }
                            } else if (item.class === 'Tier') {
                                await int.editReply("You already have a renewal for this tier in your cart dummy >.<");
                                break mainProcess;
                            }
                            break;           
                    }
                }
            } 
            
            if (localFunctions.compareArrays(fullPerksForTier, userPerks)) {
                await int.editReply("You can't renew when you have all the perks available for use dummy >.<");
                break mainProcess;    
            }

            let tierRenewal = { name: userTier.name ,type: 'Renewal', price: fullTier.generalRenewalPrice, class: 'Tier'};
            newCart.push(tierRenewal);
            contentString = contentString.concat(`\n • `, `**Name:** ${tierRenewal.name} \n   **Price:** ${tierRenewal.price}$ \n **   Type:** ${tierRenewal.type}\n`);
            console.log(newCart);

            await localFunctions.setCart(userId, newCart, collection);
            addedToCartEmbed.setDescription(`**\`\`\`prolog\n🚀 Content added to your cart᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**${contentString}`); 
            const mainComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('premium-info')
                    .setLabel('✒️ Continue Shopping')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('shopping-cart')
                    .setLabel('✅ Check your cart')
                    .setStyle('Primary'),
            ) 
            await int.editReply({
                content: '',
                embeds: [addedToCartEmbed],
                components: [mainComponents],
            });

        } catch (e) {
            console.log(e);
            mongoClient.close();
        }    
    }
}