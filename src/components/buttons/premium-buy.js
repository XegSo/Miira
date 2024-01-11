const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { selectionTier } = require('../selectMenus/premium-tiers');
const premiumBuyCache = new Map();

module.exports = {
    data: {
        name: 'premium-buy'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        var arrayOfObjects = [];
        var price = 0;
        var buyComponents = null;

        let buyMenu = new SelectMenuBuilder()
            .setCustomId('add-content-to-cart')
            .setPlaceholder('Add content to your shopping cart.')  
            .setMinValues(1)

        let buyEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setTimestamp()
            .setColor('#f26e6a')   
        main: try {
            if (!selectionTier.size) {
                int.editReply({
                    content: 'Illegal action performed. Try opening this menu again.',
                });
                break main;
            }
            const selectedTier = selectionTier.get(int.user.id).tier;
            buyEmbed.setDescription(`**\`\`\`ml\n🚀 ${selectedTier.name}\`\`\`**\n • ${selectedTier.description}\n • Select if you would like to buy the tier or some perks of it᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼`) 
            const selectedTierInteger = localFunctions.premiumToInteger(selectedTier.name);
            let userTierInteger = 0;
            let userTier = {};
            let userCart = await localFunctions.getCart(userId, collection);
            let userTierDB = await localFunctions.getTier(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            if (userTierDB.length) {
                userTier = localConstants.premiumTiers.find(t => t.name === userTierDB.name);
                userTierInteger = localFunctions.premiumToInteger(userTier.name);
                if (selectedTierInteger > userTierInteger) {
                    buyMenu.addOptions({ label: selectedTier.name, value: selectedTier.name, description: `Upgrade cost:${selectedTier.cost - userTier.cost}$` });
                    arrayOfObjects.push({ name: selectedTier.name, type: "Upgrade", price: price });
                } else if (selectedTierInteger !== userTierInteger) {
                    buyMenu.addOptions({ label: selectedTier.name, value: selectedTier.name, description: `Cost: ${selectedTier.cost}$` });
                    arrayOfObjects.push({ name: selectedTier.name, type: "Tier", price: selectedTier.cost });
                }   
            } else {
                buyMenu.addOptions({ label: selectedTier.name, value: selectedTier.name, description: `Cost: ${selectedTier.cost}$` });
                arrayOfObjects.push({ name: selectedTier.name, type: "Tier", price: selectedTier.cost });
            }

            let type = null;
            for (const perk of selectedTier.perks) {
                if (!perk.individualPrice || !perk.renewalPrice || userPerks.find(p => p.name === perk.name) || userCart.find(p => p.name === perk.name)) {
                    continue;
                }
                if (userTierDB && (userTierInteger >= selectedTierInteger)) {
                    type = "Renewal";
                    price = perk.renewalPrice;
                } else {
                    type = "Perk";
                    price = perk.individualPrice;
                }
                buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Cost: ${price}$` });
                arrayOfObjects.push({ name: perk.name, type: type, price: price, tier: localFunctions.premiumToInteger(selectedTier.name) });
            }   

            buyMenu.setMaxValues(buyMenu.options.length);

            premiumBuyCache.set(int.user.id, {
                choices: arrayOfObjects,
            });

            buyComponents = new ActionRowBuilder().addComponents(buyMenu);
            int.editReply({
                content: '',
                embeds: [buyEmbed],
                components: [buyComponents],
            });
        } catch {
            int.editReply({
                content: 'Illegal action performed. Try opening this menu again.',
            });
        } finally {
            selectionTier.delete(int.user.id);
            mongoClient.close();
        } 
    },
    premiumBuyCache: premiumBuyCache
}