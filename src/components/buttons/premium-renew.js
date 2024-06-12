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
        const collection = client.db.collection("OzenCollection");
        const userId = int.user.id;

        mainProcess: try {
            let newCart = [];
            let addedToCartEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
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
            
            if (localFunctions.areAllContained(fullPerksForTier, userPerks)) {
                await int.editReply("You can't renew when you have all the perks available for use dummy >.<");
                break mainProcess;    
            }

            let tierRenewal = { name: userTier.name ,type: 'Renewal', price: fullTier.generalRenewalPrice, class: 'Tier'};
            newCart.push(tierRenewal);
            contentString = contentString.concat("\n • ", `**Name:** ${tierRenewal.name} \n   **Price:** ${tierRenewal.price}$ \n **   Type:** ${tierRenewal.type}\n`);

            await localFunctions.setCart(userId, newCart, collection);
            addedToCartEmbed.setDescription(`**\`\`\`prolog\n🚀 Content added to your cart\`\`\`**                                                                                                        ${contentString}`); 
            addedToCartEmbed.addFields(
                {
                    name: "‎",
                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                }
            )
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
        }
    }
}