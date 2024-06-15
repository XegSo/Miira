const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'verify-paypal'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collectionPayments = client.db.collection('PD');
        const collection = client.db.collection('OzenCollection');
        const email = int.fields.getTextInputValue('email');
        const guild = client.guilds.cache.get(localConstants.guildId);

        let paymentData = await localFunctions.getPaymentInfo(email, collectionPayments);
        let userPendingAmount = await localFunctions.getPendingPaymentAmount(userId, collection);
        let currentTier = await localFunctions.getUserTier(userId, collection);
        if (paymentData.length !== 0) {
            if (userPendingAmount === parseInt(paymentData.amount)) {
                console.log('A new payment has been verified');
                const pendingMember = await guild.members.fetch(userId);
                let perksToAssign = [];
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (userPerks.length !== 0) {
                    perksToAssign = userPerks;
                }
                let allPerksForTier = [];
                let userCart = await localFunctions.getCart(userId, collection);
                const premiumLogEmbed = new EmbedBuilder()
                    .setAuthor({ name: '✔️ A new premium purchase has been made.' })
                    .setThumbnail(int.user.displayAvatarURL())
                    .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**Total amount payed: ${userPendingAmount}$**\n**Purchase made by <@${userId}>**\n**Payment method: ${paymentData.type}**`)
                    .setTimestamp();

                for (let item of userCart) {
                    let fullPerk = localConstants.premiumPerks.find(e => e.name === item.name);
                    premiumLogEmbed.addFields(
                        {
                            name: '᲼',
                            value: `**\`\`🔗 ${item.name}\`\`**\n ├ Type: ${item.type}\n └ Price: ${item.price}$`
                        }
                    );
                    switch (item.type) {
                    case 'Tier':
                        allPerksForTier = await localFunctions.getFullPerksOfTierWNR(localFunctions.premiumToInteger(item.name));
                        for (let perk of allPerksForTier) {
                            if (typeof userPerks.find((e) => e.name === perk.name) === 'undefined') {
                                perksToAssign.push(perk);
                            }
                        }
                        for (let tier of localConstants.premiumTiers) {
                            if (tier.name === item.name) {
                                await pendingMember.roles.add(tier.roleId);
                                await pendingMember.roles.add('743505566617436301');
                                await localFunctions.assignPremium(userId, pendingMember, collection);
                                break;
                            }
                        }
                        break;
                    case 'Perk':
                        if (userPerks.length !== 0) {
                            perksToAssign = userPerks;
                        }
                        perksToAssign.push(fullPerk);
                        break;
                    case 'Upgrade':
                        await pendingMember.roles.remove(currentTier.id);
                        allPerksForTier = await localFunctions.getFullPerksOfTierWNR(localFunctions.premiumToInteger(item.name));
                        for (let perk of allPerksForTier) {
                            if (typeof userPerks.find((e) => e.name === perk.name) === 'undefined') {
                                perksToAssign.push(perk);
                            }
                        }
                        for (let tier of localConstants.premiumTiers) {
                            if (tier.name === item.name) {
                                await pendingMember.roles.add(tier.roleId);
                                break;
                            }
                        }
                        currentTier.name = item.name;
                        await localFunctions.setUserTier(userId, currentTier, collection);
                        break;
                    case 'Renewal':
                        if (item.class === 'Perk') {
                            let fullRenewal = localConstants.premiumPerks.find(e => e.name === item.name);
                            perksToAssign.push(fullRenewal);
                            break;
                        } else if (item.class === 'Tier') {
                            allPerksForTier = await localFunctions.getFullPerksOfTierWNR(localFunctions.premiumToInteger(item.name));
                            for (let perk of allPerksForTier) {
                                if (typeof userPerks.find((e) => e.name === perk.name) === 'undefined') {
                                    perksToAssign.push(perk);
                                }
                            }
                        }
                    }
                }
                await localFunctions.delCart(userId, collection);
                await localFunctions.setPerks(userId, perksToAssign, collection);
                await localFunctions.liquidatePaymentData(email, collectionPayments);
                await int.editReply({
                    content: 'Your payment has been verified! Thank you for your purchase, check your new status using /collabs premium.'
                });
                const premiumLogChannel = guild.channels.cache.get('1195256632318365746');
                premiumLogChannel.send({ content: '', embeds: [premiumLogEmbed] });
            } else {
                await int.editReply({
                    content: 'A payment with a different amount has been found. If you sent the wrong amount, DM <@687004886922952755> for a refund or if you think this is a mistake.'
                });
            }
        } else {
            await int.editReply({
                content: 'Your payment hasn\'t been found. Please make sure you typed your email right in the form. Try again or in case you\'re sure you didn\'t make a typo, contact the owner <@687004886922952755>'
            });
        }
    }
};
