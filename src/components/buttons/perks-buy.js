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
            .setAuthor({ name: `Welcome to the perk shop ${int.user.tag}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
            .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })

        try {
            let userCart = await localFunctions.getCart(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            let dbTier = await localFunctions.getTier(userId, collection);
            let fullTier = [];
            let userPerksNR = [];
            let allPossiblePerks = [];
            let renewalString = '';
            let purchaseablePerks = [];
            if (typeof dbTier !== "undefined") {
                console.log('a');
                userTier = localFunctions.premiumToInteger(dbTier.name);
                fullTier = localConstants.premiumTiers.find((e) => e.name === dbTier.name);
                renewalString = `*Renewal Price for all perks: ${fullTier.generalRenewalPrice ? fullTier.generalRenewalPrice : 'You are on the peak tier! how awesone'}$*`
                allPossiblePerks = await localFunctions.getFullPerksOfTier(userTier);
                userPerksNR = userPerks.filter((e) => e.renewalPrice !== null);
                if (typeof allPossiblePerks.find((e) => userPerks.find((p) => p.name === e.name)) === "undefined" && typeof dbTier !== "undefined") {
                    console.log('b');
                    buyMenu.addOptions({ label: fullTier.name, value: fullTier.name, description: `Renewal cost: ${fullTier.generalRenewalPrice}$` });
                    arrayOfObjects.push({ name: fullTier.name, type: "Renewal", price: fullTier.generalRenewalPrice, tier: fullTier.id, class: 'Tier' });
                }  
            } else {
                userTier = 0
                dbTier = {name: 'None!'}
                renewalString = `Renewal of all perks is not possible with the current premium status.`
            }
            buyEmbed.setDescription(`**Current Tier: ${dbTier.name}**\n${renewalString}`)
            if (dbTier.name !== "None!" && (dbTier.name !== "Mirage VII" || dbTier.name !== "Mirage X")) {
                buyEmbed.addFields(
                    {
                        name: ` `,
                        value: `**\`\`\`prolog\n💵 Renewable perks᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`,
                    }
                )
            } else if ((dbTier.name == "Mirage VII" || dbTier.name == "Mirage X") && localFunctions.compareArrays(userPerksNR,allPossiblePerks)) {
                buyEmbed.addFields(
                    {
                        name: ` `,
                        value: `**\`\`\`prolog\n🥂 Nice to see you here! If you're interested on another hoodie or hosting another megacollab, DM xegc!\`\`\`**`,
                    }
                )
                buyMenu.addOptions({ label: 'The love from the server owner', value: perk.name, description: `uwu (I had to add something lol discord gets angry if I don't)` });
            }
            localConstants.premiumTiers.forEach((tier) => {  
                tier.perks.forEach((perk) => {
                    if (!(userCart.find(p => p.name === perk.name) || userPerks.find(pp => pp.name === perk.name)) && perk.renewalPrice && perk.individualPrice) {
                        if (perk.renewalPrice && (userTier >= tier.id)) {
                            buyEmbed.addFields(
                                {
                                    name: ` `,
                                    value: `\`\`✒️ ${perk.avname}\`\`
                                 **└ Renewal:** ${perk.renewalPrice}$`,
                                    inline: true,
                                }
                            )
                            buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Renewal cost: ${perk.renewalPrice}$` });
                            arrayOfObjects.push({ name: perk.name, type: "Renewal", price: perk.renewalPrice, tier: tier.id, class: 'Perk' });
                        } else if (perk.individualPrice && ((tier.id > userTier) || ((userTier === 7 || userTier === 10) && (perk.avname === 'Endless Mirage Hoodie' || perk.avname === 'Host a Megacollab')))) {
                            let neededData = {avname: perk.avname, name: perk.name, individualPrice: perk.individualPrice, id: tier.id}
                            purchaseablePerks.push(neededData);
                        }
                    }
                });
            }); 
            if (purchaseablePerks.length !== 0) {
                buyEmbed.addFields(
                    {
                        name: ` `,
                        value: `**\`\`\`prolog\n💵 Purchaseable perks᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`,
                    }
                )
                for (perk of purchaseablePerks) {
                    buyEmbed.addFields(
                        {
                            name: ` `,
                            value: `\`\`✒️ ${perk.avname}\`\`
                         **└ Cost:** ${perk.individualPrice}$`,
                            inline: true,
                        }
                    )
                    buyMenu.addOptions({ label: perk.name, value: perk.name, description: `Purchase cost: ${perk.individualPrice}$` });
                    arrayOfObjects.push({ name: perk.name, type: "Perk", price: perk.individualPrice, tier: perk.id });
                }
            }
            buyMenu.setMaxValues(buyMenu.options.length);
            buyComponents = new ActionRowBuilder().addComponents(buyMenu);
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