const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const perkCache = new Map();

module.exports = {
    data: {
        name: 'perks-buy'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        var userTier = 0;
        var arrayOfObjects = [];
        var price = 0;
        var buyComponents = null;

        let buyMenu = new SelectMenuBuilder()
            .setCustomId('add-content-to-cart')
            .setPlaceholder('Add content to your shopping cart.')  
            .setMinValues(1)

        let buyEmbed = new EmbedBuilder()  
            .setTimestamp()
            .setColor('#f26e6a')
            .setAuthor({ name: `💎 Welcome to the perk shop ${int.user.tag}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setThumbnail(int.user.displayAvatarURL()) 

        try {
            let userCart = await localFunctions.getCart(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            let dbTier = await localFunctions.getTier(userId, collection);
            let fullTier = [];
            console.log(dbTier);
            if (typeof dbTier !== "undefined") {
                userTier = localFunctions.premiumToInteger(dbTier.name);
                fullTier = localConstants.premiumTiers.find((e) => e.name === dbTier.name);
            } else {
                userTier = 0
            }
            console.log(userTier);
            buyEmbed.addFields(
                {
                    name: `**Current Tier: ${userTier}**`,
                    value: `\`\`\`💵 Renewable and Purchaseable Perks\`\`\``,
                }
            )
            localConstants.premiumTiers.forEach((tier) => {
                tier.perks.forEach((perk) => {
                    if (!(userCart.find(p => p.name === perk.name) || userPerks.find(pp => pp.name === perk.name)) && perk.renewalPrice && perk.individualPrice) {
                        if (userTier > localFunctions.premiumToInteger(tier.name)) {
                            price = perk.renewalPrice;
                        } else {
                            price = perk.individualPrice;
                        }
                        if (!userPerks.length && typeof dbTier !== "undefined") {
                            buyEmbed.addFields(
                                {
                                    name: `‎`,
                                    value: `\`\`✒️ Renewal for Tier ${userTier}\`\`
                                 [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                                 └ Renewal cost: ${fullTier.generalRenewalPrice}$`,
                                }
                            )
                            buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Renewal cost: ${perk.renewalPrice}$` });
                            arrayOfObjects.push({ name: perk.name, type: "Renewal", price: price, tier: tier.id, class: 'Tier' });
                        }
                        if (perk.renewalPrice && (userTier >= tier.id)) {
                            buyEmbed.addFields(
                                {
                                    name: `‎`,
                                    value: `\`\`✒️ ${perk.name}\`\`
                                 [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                                 └ Renewal cost: ${perk.renewalPrice}$`,
                                }
                            )
                            buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Renewal cost: ${perk.renewalPrice}$` });
                            arrayOfObjects.push({ name: perk.name, type: "Renewal", price: price, tier: tier.id, class: 'Perk' });
                        } else if (perk.individualPrice && (tier.id > userTier)) {
                            buyEmbed.addFields(
                                {
                                    name: `‎`,
                                    value: `\`\`✒️ ${perk.name}\`\`
                                 [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                                 └ Purchase cost: ${perk.individualPrice}$`,
                                }
                            )
                            buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Purchase cost: ${perk.individualPrice}$` });
                            arrayOfObjects.push({ name: perk.name, type: "Perk", price: price, tier: tier.id });
                        }
                    }
                });
            });
            buyMenu.setMaxValues(buyMenu.options.length);
            buyComponents = new ActionRowBuilder().addComponents(buyMenu);
            buyMenu.setMaxValues(buyMenu.options.length);
            perkCache.set(int.user.id, {
                choices: arrayOfObjects,
            });
            int.editReply({
                content: '',
                embeds: [buyEmbed],
                components: [buyComponents],
            });
        } finally {
            mongoClient.close();
        }      
    },
    perkCache: perkCache
}