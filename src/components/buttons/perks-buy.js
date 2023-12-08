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
            .setColor('#f26e6a')
            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setDescription(`\`\`\`🚀 Buy more Perks\`\`\`\n • Select the perks you would like to buy`)    

        try {
            let userCart = await localFunctions.getCart(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            let dbTier = await localFunctions.getTier(userId, collection);
            if (dbTier.length) {
                userTier = localFunctions.premiumToInteger(dbTier.name);
            }
            localConstants.premiumTiers.forEach((tier) => {
                tier.perks.forEach((perk) => {
                    if (!(userCart.find(p => p.name === perk.name) || userPerks.find(pp => pp.name === perk.name)) && perk.renewalPrice && perk.individualPrice) {
                        if (userTier > localFunctions.premiumToInteger(tier.name)) {
                            price = perk.renewalPrice;
                        } else {
                            price = perk.individualPrice;
                        }
                        buyMenu.addOptions({ label: perk.name , value: perk.name, description: `Cost: ${price}$` })
                        arrayOfObjects.push({ name: perk.name, type: "Perk", price: price });
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