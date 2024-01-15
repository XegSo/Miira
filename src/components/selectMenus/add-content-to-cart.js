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

            let newCart = [];
            console.log(initializedMap.get(int.user.id));
            const allOptions = initializedMap.get(int.user.id).choices;
            let fullChoices = allOptions.filter(obj => pendingItems.includes(obj.name))  
            let addedToCartEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a') 
            let contentString = "";
            let userTier = await localFunctions.getUserTier(userId, collection);
            let tierInChoices = await fullChoices.find((element) => element.type === "Tier");
            let perksInChoices = await fullChoices.filter((element) => element.type === "Perk");
            let renewalsInChoices = await fullChoices.filter((element) => element.type === "Renewal");
            let upgradeInChoices = await fullChoices.find((element) => element.type === "Upgrade");

            if (userTier && typeof tierInChoices !== "undefined") { //TO BE REWRITTEN
                console.log(tierInChoices);
                if (userTier.name === tierInChoices.name) {
                    int.editReply({
                        content: 'You cannot add the tier you already have.',
                        components: [mainComponents],
                    });
                    break mainProcess; 
                }
                if (localFunctions.premiumToInteger(tierInChoices.name) > localFunctions.premiumToInteger(userTier.name)) {
                    console.log('changing tier type to upgrade');
                    upgradeInChoices = tierInChoices;
                    upgradeInChoices.type = 'Upgrade';
                    upgradeInChoices.price = upgradeInChoices.price - localConstants.premiumTiers.find((element) => element.name === userTier.name).cost;
                    tierInChoices = await fullChoices.find((element) => element.type === "Upgrade");
                } else {
                    int.editReply({
                        content: 'You cannot downgrade your tier this way.',
                        components: [mainComponents],
                    });
                    break mainProcess;
                }
            }
            if (perksInChoices.length && typeof tierInChoices !== "undefined") {
                int.editReply({
                    content: 'You cannot add the tier and the perks of that tier at the same time. The tier itself already includes the perks.',
                    components: [mainComponents],
                });
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
                                    int.editReply({
                                        content: 'You already have this tier in your cart.',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                            }
                            if (perksInChoices.length) {
                                for (perk of perksInChoices) {
                                    if (localFunctions.premiumToInteger(item.name) >= perk.tier) {
                                        int.editReply({
                                            content: 'You cannot add a perk while having a tier that includes it in your cart. Please remove the tier of your cart first before adding.',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }  
                            }
                            break;
                        case 'Upgrade':
                            if (typeof upgradeInChoices !== "undefined") {
                                console.log(upgradeInChoices);
                                if (item.name === upgradeInChoices.name) {
                                    int.editReply({
                                        content: 'You already have this upgrade in your cart.',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                            }
                            if (perksInChoices.length) {
                                for (perk of perksInChoices) {
                                    if (localFunctions.premiumToInteger(item.name) >= perk.tier) {
                                        int.editReply({
                                            content: 'You cannot add a perk while having a tier that includes it in your cart. Please remove the tier of your cart first before adding.',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }  
                            }
                            if (renewalsInChoices.length) {
                                for (perk of renewalsInChoices) {
                                    if (localFunctions.premiumToInteger(item.name) >= perk.tier) {
                                        int.editReply({
                                            content: 'You cannot add a perk renewal while having a tier that includes it in your cart. Please remove the tier of your cart first before adding.',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }  
                            }
                            break;
                        case 'Perk':
                            if (perksInChoices.find((element) => element.name === item.name)) {
                                int.editReply({
                                    content: 'You already have this in your cart.',
                                    components: [mainComponents],
                                });
                                break mainProcess;
                            }
                            if (typeof upgradeInChoices !== "undefined") {
                                console.log(upgradeInChoices);
                                if (localFunctions.premiumToInteger(upgradeInChoices.name) >= item.tier) {
                                    int.editReply({
                                        content: 'You cannot add this tier while having perks that its purchase includes in your cart. Please remove the perks of your cart first before adding.',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                            } else if (typeof tierInChoices !== "undefined") {
                                console.log(tierInChoices);
                                if (localFunctions.premiumToInteger(tierInChoices.name) >= item.tier) {
                                    int.editReply({
                                        content: 'You cannot add this tier while having perks that its purchase includes in your cart. Please remove the perks of your cart first before adding.',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                            }
                            break;
                        case 'Renewal':
                            if (item.class === 'Perk') {
                                if (typeof upgradeInChoices !== "undefined") {
                                    if (localFunctions.premiumToInteger(upgradeInChoices.name) >= item.tier) {
                                        int.editReply({
                                            content: 'You cannot add a tier upgrade while having perks renewals that this tier includes in your cart. Remove the perk renewals before proceeding.',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }
                                if (renewalsInChoices.length === 1) {
                                    if (localFunctions.premiumToInteger(renewalsInChoices[0].name) >= item.tier) {
                                        int.editReply({
                                            content: 'You cannot add a tier renewal while having perks renewals that this tier includes in your cart. Remove the perk renewals before proceeding.',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }
                                if (renewalsInChoices.length > 1) {
                                    if (renewalsInChoices.find((element) => element.name === item.name)) {
                                        int.editReply({
                                            content: 'You already have this in your cart!',
                                            components: [mainComponents],
                                        });
                                        break mainProcess;
                                    }
                                }
                            } else if (item.class === 'Tier') {
                                if (typeof renewalsInChoices.find((e) => e.name === item.name) !== "undefined") {
                                    int.editReply({
                                        content: 'You already have this in your cart!',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                                let renewalInt = localFunctions.premiumToInteger(item.name);
                                let perksInRenewal = await localFunctions.getFullPerksOfTier(renewalInt);
                                if (typeof perksInRenewal.find((element) => perksInChoices.find((e) => e.name === element.name)) !== "undefined" || typeof perksInRenewal.find((element) => renewalsInChoices.find((e) => e.name === element.name)) !== "undefined") {
                                    int.editReply({
                                        content: 'Cannot add this perk while having a tier renewal in your cart that includes it. Remove the tier renewal before proceeding.',
                                        components: [mainComponents],
                                    });
                                    break mainProcess;
                                }
                            } 
                            if (typeof upgradeInChoices !== "undefined") {
                                int.editReply({
                                    content: 'You cannot add a tier upgrade while having a tier renewal in your cart. Remove the renewal before proceeding.',
                                    components: [mainComponents],
                                });
                                break mainProcess;
                            }
                            break;           
                    }
                }
            }

            if (typeof tierInChoices !== "undefined" && typeof upgradeInChoices == "undefined") {
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
            addedToCartEmbed.setDescription(`**\`\`\`prolog\n🚀 Content added to your cart\`\`\`                                                                                                           **${contentString}`); 
            addedToCartEmbed.addFields(
                {
                    name: `‎`,
                    value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                }
            )
            int.editReply({
                content: '',
                embeds: [addedToCartEmbed],
                components: [mainComponents],
            });

        } catch (e) {
            int.editReply("Please reopen the menu if you desire to add another item to your cart!");
            console.log(e);
            mongoClient.close();
        } finally {
            mongoClient.close();
        }
    }
}