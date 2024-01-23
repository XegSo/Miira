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
        const guild = client.guilds.cache.get(localConstants.guildId);
        let messageId = null;
        let messageTier = [];
        if (int.message.channelId === '767374005782052864') {
            messageId = int.message.id;
        }
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const userId = int.user.id;
        const guildMember = await guild.members.fetch(userId)
        var arrayOfObjects = [];
        var price = 0;
        var buyComponents = null;

        let buyMenu = new SelectMenuBuilder()
            .setCustomId('add-content-to-cart')
            .setPlaceholder('Add content to your shopping cart.')  
            .setMinValues(1)

        let buyEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')   
        main: try {
            let userTierDB = await localFunctions.getTier(userId, collection);
            if (!selectionTier.size) {
                if (userTier.length === 0 && guildMember.roles.cache.has('743505566617436301')) {
                    await localFunctions.assignPremium(int, userId, collection, guildMember);
                }
                if (messageId) {
                    
                    switch (messageId) {
                        case '1195513874032631961':
                            messageTier = localConstants.premiumTiers[0];
                        break;
                        case '1195513875139936337':
                            messageTier = localConstants.premiumTiers[1];
                        break;
                        case '1195513876377260074':
                            messageTier = localConstants.premiumTiers[2];
                        break;
                        case '1195513877350338701':
                            messageTier = localConstants.premiumTiers[3];
                        break;
                        case '1195513878482796605':
                            messageTier = localConstants.premiumTiers[4];
                        break;
                        case '1195513899219423293':
                            messageTier = localConstants.premiumTiers[5];
                        break;
                        case '1195513901194936464':
                            messageTier = localConstants.premiumTiers[6];
                        break;
                    }
                    selectionTier.set(int.user.id, {
                        tier: messageTier,
                    });
                } else {
                    await int.editReply({
                        content: 'Illegal action performed. Try opening this menu again.',
                    });
                    break main;
                }
            }
            const selectedTier = selectionTier.get(int.user.id).tier;
            buyEmbed.setDescription(`**\`\`\`ml\n🚀 ${selectedTier.name}\`\`\`**                                                                                                           \n • ${selectedTier.description}\n • Select if you would like to buy the tier or some perks of it`) 
            const selectedTierInteger = localFunctions.premiumToInteger(selectedTier.name);
            let userTierInteger = 0;
            let userTier = {};
            userTierDB = await localFunctions.getTier(userId, collection);
            let userCart = await localFunctions.getCart(userId, collection);
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
                if (!perk.individualPrice || !perk.renewalPrice || typeof userPerks.find(p => p.name === perk.name) !== "undefined" || typeof userCart.find(p => p.name === perk.name) !== "undefined") {
                    continue;
                }
                if (userTierDB.length !== 0 && (userTierInteger >= selectedTierInteger)) {
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

            buyEmbed.addFields(
                {
                    name: `‎`,
                    value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                }
            )

            buyComponents = new ActionRowBuilder().addComponents(buyMenu);
            await int.editReply({
                content: '',
                embeds: [buyEmbed],
                components: [buyComponents],
            });
        } catch (e) {
            await int.editReply({
                content: 'Illegal action performed. Try opening this menu again.',
            });
            console.log(e);
        } finally {
            selectionTier.delete(int.user.id);
            mongoClient.close();
        } 
    },
    premiumBuyCache: premiumBuyCache
}