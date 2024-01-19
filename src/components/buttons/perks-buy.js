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
            .setAuthor({ name: `Welcome to the perk shop ${int.user.tag}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })

        try {
            let userCart = await localFunctions.getCart(userId, collection);
            let userPerks = await localFunctions.getPerks(userId, collection);
            let dbTier = await localFunctions.getTier(userId, collection);
            let fullTier = [];
            let userPerksNR = [];
            let allPossiblePerks = [];
            let renewalString = '';
            let purchaseablePerks = [];
            let i = false;
            if (typeof dbTier !== "undefined") {
                userTier = localFunctions.premiumToInteger(dbTier.name);
                fullTier = localConstants.premiumTiers.find((e) => e.name === dbTier.name);
                renewalString = `*Renewal Price for all perks: ${fullTier.generalRenewalPrice ? fullTier.generalRenewalPrice : 'You are on the peak tier! Your renewal price is 0'}$`
                allPossiblePerks = await localFunctions.getFullPerksOfTier(userTier);
                userPerksNR = userPerks.filter((e) => e.renewalPrice !== null);
                if (typeof allPossiblePerks.find((e) => userPerks.find((p) => p.name === e.name)) === "undefined" && typeof dbTier !== "undefined") {
                    buyMenu.addOptions({ label: fullTier.name, value: fullTier.name, description: `Renewal cost: ${fullTier.generalRenewalPrice}$` });
                    arrayOfObjects.push({ name: fullTier.name, type: "Renewal", price: fullTier.generalRenewalPrice, tier: fullTier.id, class: 'Tier' });
                }  
            } else {
                userTier = 0
                dbTier = {name: 'None!'}
                renewalString = `Renewal of all perks is not possible with the current premium status.`
            }
            if (dbTier.name !== "None!" && (userTier !== 7 && userTier !== 10) && !localFunctions.compareArrays(allPossiblePerks, userPerksNR)) {
                renewalString = renewalString.concat(`*\n                                                                                                        **\`\`\`prolog\n💵 Renewable perks\`\`\`**\n`)
                buyEmbed.setDescription(`**Current Tier: ${dbTier.name}**\n${renewalString}`);
                i = true;
            } else if ((userTier === 7 || userTier === 10) && localFunctions.compareArrays(userPerksNR,allPossiblePerks)) {
                renewalString = renewalString.concat(`*\n                                                                                                        **\`\`\`ml\n🥂 Nice to see you here! If you're interested on another hoodie or hosting another megacollab, DM xegc!\`\`\`**`)
                buyEmbed.setDescription(`**Current Tier: ${dbTier.name}**\n${renewalString}`);
                buyMenu.addOptions({ label: 'The love from the server owner', value: 'secret', description: `uwu (I had to add something lol discord gets angry if I don't)` });
                i = true;
            }
            localConstants.premiumTiers.forEach((tier) => {  
                tier.perks.forEach((perk) => {
                    if (!(userCart.find(p => p.name === perk.name) || userPerks.find(pp => pp.name === perk.name)) && perk.renewalPrice && perk.individualPrice) {
                        if (perk.renewalPrice && (userTier >= tier.id)) {
                            buyEmbed.addFields(
                                {
                                    name: ` `,
                                    value: `\`\`✒️ ${perk.avname}\`\`\n **└ Renewal:** ${perk.renewalPrice}$`,
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
                if (i) {
                    buyEmbed.addFields(
                        {
                            name: ` `,
                            value: `**\`\`\`prolog\n💵 Purchaseable perks\`\`\`**\n`,
                        }
                    )
                } else {
                    renewalString = renewalString.concat(`*\n                                                                                                        **\`\`\`prolog\n💵 Purchaseable perks\`\`\`**\n`)
                    buyEmbed.setDescription(`**Current Tier: ${dbTier.name}**\n${renewalString}`);
                }
                for (perk of purchaseablePerks) {
                    buyEmbed.addFields(
                        {
                            name: ` `,
                            value: `\`\`✒️ ${perk.avname}\`\`\n **└ Cost:** ${perk.individualPrice}$`,
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
            buyEmbed.addFields(
                {
                    name: `‎`,
                    value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                }
            )
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