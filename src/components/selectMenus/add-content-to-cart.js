const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { premiumBuyCache } = require('../buttons/premium-buy');
const { perkCache } = require('../buttons/perks-buy');
const { upgradeCache } = require('../buttons/upgrade-tier');

module.exports = {
    data: {
        name: 'add-content-to-cart'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const allMaps = [premiumBuyCache, perkCache, upgradeCache];
        const userId = int.user.id;
        const pendingItems = int.values;
        const initializedMap = [premiumBuyCache, perkCache, upgradeCache].find(map => map.size > 0);
        const initializedMapIndex = [premiumBuyCache, perkCache, upgradeCache].findIndex(map => map.size > 0);

        mainProcess: try {
            if (typeof initializedMap == "undefined") {
                int.editReply("This action cannot be performed. Open the shop dashboard again to proceed.");
                break mainProcess; 
            }
            let newCart = [];
            const allOptions = initializedMap.get(int.user.id).choices;
            let fullChoices = allOptions.filter(obj => pendingItems.includes(obj.name))  
            let addedToCartEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')  
            let contentString = "";
            let userTier = await localFunctions.getUserTier(userId, collection);
            let tierInChoices = await fullChoices.find((element) => element.type === "Tier");
            let perksInChoices = await fullChoices.filter((element) => element.type === "Perk");
            let renewalsInChoices = await fullChoices.filter((element) => element.type === "Renewal");
            let upgradeInChoices = await fullChoices.find((element) => element.type === "Upgrade");

            if (userTier && typeof tierInChoices !== "undefined") { //TO BE REWRITTEN
                console.log(tierInChoices);
                if (userTier.name === tierInChoices.name) {
                    int.editReply("You cannot add the tier you already have.");
                    break mainProcess; 
                }
                if (localFunctions.premiumToInteger(tierInChoices.name) >= localFunctions.premiumToInteger(userTier.name)) {
                    console.log('changing tier type to upgrade');
                    upgradeInChoices = tierInChoices;
                    upgradeInChoices.type = 'Upgrade';
                    upgradeInChoices.price = upgradeInChoices.price - localConstants.premiumTiers.find((element) => element.name === userTier.name).cost;
                    tierInChoices = await fullChoices.find((element) => element.type === "Upgrade");
                } else {
                    if (localFunctions.premiumToInteger(userTier.name) >= localFunctions.premiumToInteger(tierInChoices.name)) {
                        int.editReply("You cannot downgrade your tier this way.");
                        break mainProcess;
                    } else {
                        upgradeInChoices = [{name: tierInChoices.name, type: 'Upgrade', price: tierInChoices.price - localConstants.premiumTiers.find((e) => e.name === userTier.name).cost}];
                        tierInChoices = await fullChoices.find((element) => element.type === "Upgrade");
                    }
                }
            }
            if (perksInChoices.length && typeof tierInChoices !== "undefined") {
                int.editReply("You cannot add the tier and the perks of that tier at the same time. The tier itself already includes the perks");
                break mainProcess;
            }

            let cartItems = await localFunctions.getCart(userId, collection);
            console.log(`Current Cart: ${cartItems}`);
            newCart = cartItems;

            if (perksInChoices.length && userTier) {
                let userTierInt = localFunctions.premiumToInteger(userTier.name);
                for (perk of perksInChoices) {
                    if (userTierInt >= perk.tier) {
                        console.log('changing perk type to renewal');
                        let objIndex = perksInChoices.findIndex((obj => obj.name === perk.name));
                        let perkToRenew = perksInChoices.splice(objIndex, 1)[0];
                        renewalsInChoices.push(perkToRenew);
                        let renewalIndex = renewalsInChoices.findIndex((obj => obj.name === perk.name));
                        renewalsInChoices[renewalIndex].type = 'Renewal';
                        renewalsInChoices[renewalIndex].price = perk.renewalPrice;
                        perksInChoices.splice(objIndex, 1);
                    }
                }
            }

            if (cartItems.length) {
                for (item of cartItems) {
                    switch (item.type) {
                        case 'Tier':
                            if (typeof tierInChoices !== "undefined") {
                                if (item.name === tierInChoices.name) {
                                    int.editReply("You already have this tier in your cart.");
                                    break mainProcess;
                                }
                            }
                            if (perksInChoices.length) {
                                for (perk of perksInChoices) {
                                    if (localFunctions.premiumToInteger(item.name) >= perk.tier) {
                                        int.editReply("You cannot add a perk while having a tier that includes it in your cart. Please remove the tier of your cart first before adding.");
                                        break mainProcess;
                                    }
                                }  
                            }
                            break;
                        case 'Upgrade':
                            if (typeof upgradeInChoices !== "undefined") {
                                console.log(upgradeInChoices);
                                if (item.name === upgradeInChoices.name) {
                                    int.editReply("You already have this upgrade in your cart.");
                                    break mainProcess;
                                }
                            }
                            if (perksInChoices.length) {
                                for (perk of perksInChoices) {
                                    if (localFunctions.premiumToInteger(item.name) >= perk.tier) {
                                        int.editReply("You cannot add a perk while having a tier that includes it in your cart. Please remove the tier of your cart first before adding.");
                                        break mainProcess;
                                    }
                                }  
                            }
                            break;
                        case 'Perk':
                            if (perksInChoices.find((element) => element.name === item.name)) {
                                int.editReply("You already have this perk in your cart.");
                                break mainProcess;
                            }
                            if (typeof upgradeInChoices !== "undefined") {
                                console.log(upgradeInChoices);
                                if (localFunctions.premiumToInteger(upgradeInChoices.name) >= item.tier) {
                                    int.editReply("You cannot add this tier while having perks that its purchase includes in your cart. Please remove the perks of your cart first before adding.");
                                    break mainProcess;
                                }
                            } else if (typeof tierInChoices !== "undefined") {
                                console.log(tierInChoices);
                                if (localFunctions.premiumToInteger(tierInChoices.name) >= item.tier) {
                                    int.editReply("You cannot add this tier while having perks that its purchase includes in your cart. Please remove the perks of your cart first before adding.");
                                    break mainProcess;
                                }
                            }
                            break;
                        case 'Renewal':
                            if (item.class === 'Perk') {
                                if (typeof upgradeInChoices !== "undefined") {
                                    if (localFunctions.premiumToInteger(upgradeInChoices.name) >= item.tier) {
                                        int.editReply("You cannot add a tier upgrade while having perks renewals that this tier includes in your cart. Remove the perk renewals before proceeding.");
                                        break mainProcess;
                                    }
                                }
                                if (renewalsInChoices.length === 1) {
                                    if (localFunctions.premiumToInteger(renewalsInChoices[1].name) >= item.tier) {
                                        int.editReply("You cannot add a tier renewal while having perks renewals that this tier includes in your cart. Remove the perk renewals before proceeding.");
                                        break mainProcess;
                                    }
                                }
                                if (renewalsInChoices.length > 1) {
                                    if (renewalsInChoices.find((element) => element.name === item.name)) {
                                        int.editReply("You already have this renewal in your cart.");
                                        break mainProcess;
                                    }
                                }
                            } else if (item.class === 'Tier') {
                                if (renewalsInChoices.length > 1) {
                                    for (perk of renewalsInChoices) {
                                        if (localFunctions.premiumToInteger(item.name) > perk.tier) {
                                            int.editReply("You cannot add a perk renewal while having a tier renewal in your cart that includes the renewal of the perk.");
                                            break mainProcess;
                                        }
                                    }
                                }
                                if (renewalsInChoices.length === 1) {
                                    int.editReply("You already have this renewal in your cart.");
                                    break mainProcess;
                                }
                            }
                            break;           
                    }
                }
            }

            if (typeof tierInChoices !== "undefined") {
                console.log(`T ${tierInChoices.name}`);
                newCart = newCart.filter(obj => obj.type !== "Tier");
                newCart.push(tierInChoices);
            } else if (perksInChoices.length) {
                console.log(`P ${perksInChoices}`);
                Array.prototype.push.apply(newCart,perksInChoices);
            } else if (typeof upgradeInChoices !== "undefined") {
                console.log(`U ${upgradeInChoices.name}`);
                newCart = newCart.filter(obj => obj.type !== "Upgrade");
                newCart.push(upgradeInChoices);
            }
            if (renewalsInChoices.length) {
                console.log(`R ${renewalsInChoices}`);
                Array.prototype.push.apply(newCart,renewalsInChoices);
            }

            for (content of fullChoices) {
                contentString = contentString.concat(`\n • `, `**Name:** ${content.name} \n   **Price:** ${content.price}$ \n **   Type:** ${content.type}\n`);
            }
            console.log(newCart);
            await localFunctions.setCart(userId, newCart, collection);
            allMaps[initializedMapIndex].delete(int.user.id);
            addedToCartEmbed.setDescription(`\`\`\`🚀 Content added to your cart\`\`\`${contentString}`); 
            mainComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('premium-info')
                    .setLabel('✒️ Continue Shopping')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('shopping-cart')
                    .setLabel('✅ Check your cart')
                    .setStyle('Primary'),
            ) 
            int.editReply({
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