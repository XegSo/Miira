const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'verify-payment-sub'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collectionPayments = client.db.collection('PD');
        const collection = client.db.collection('OzenCollection');
        const email = int.fields.getTextInputValue('email');
        const guild = client.guilds.cache.get(localConstants.guildId);
        let pendingMember = await guild.members.cache.get(userId);

        let paymentData = await localFunctions.getPaymentInfo(email, collectionPayments);
        let user = await localFunctions.getUser(userId, collection);
        let userSubAmount = parseInt(user.monthlyDonation.currentAmount);
        if (paymentData.length !== 0) {
            if (userSubAmount === parseInt(paymentData.amount)) {
                const currentDate = new Date();
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                const formattedDay = String(day).padStart(2, '0');
                const formattedMonth = String(month).padStart(2, '0');
                const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
                console.log('A new sub payment has been verified.');
                let userSubData = user.monthlyDonation;
                const startingDateParts = userSubData.startingDate.split('/');
                const lastPaymentParts = userSubData.lastDate.split('/');

                const startingDate = new Date(startingDateParts[2], startingDateParts[1] - 1, startingDateParts[0]);
                const lastPayment = new Date(lastPaymentParts[2], lastPaymentParts[1] - 1, lastPaymentParts[0]);

                const monthsDiff = (lastPayment.getFullYear() - startingDate.getFullYear()) * 12 + lastPayment.getMonth() - startingDate.getMonth();
                if (typeof userSubData.months !== 'undefined') {
                    userSubData.months = userSubData.months + 1;
                } else {
                    userSubData.months = monthsDiff + 1;
                }

                userSubData.lastDate = formattedDate;
                userSubData.status = 'paid';
                let newTotal = parseInt(userSubData.total) + userSubAmount;
                userSubData.total = newTotal.toString();

                const subLogEmbed = new EmbedBuilder()
                    .setAuthor({ name: '✔️ New Subscription Payment.' })
                    .setThumbnail(int.user.displayAvatarURL())
                    .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**Amount payed: ${userSubAmount}$**\n**Payment made by <@${userId}>**\n**Payment method: ${paymentData.type}**\n**Months: ${userSubData.months} months**`)
                    .setTimestamp();

                await localFunctions.setFullSubStatus(userId, userSubData, collection);

                let userTier = await localFunctions.getUserTier(userId, collection);
                if (userTier.name === 'Mirage X') {
                    userTier.name = 'Mirage VII';
                }
                const fullTier = localConstants.premiumTiers[localFunctions.premiumToInteger(userTier.name) - 1];
                let nextTier;
                if (fullTier.name !== 'Mirage VII') {
                    nextTier = localConstants.premiumTiers[localFunctions.premiumToInteger(userTier.name)];
                } else {
                    nextTier = fullTier;
                }
                if (nextTier !== fullTier && newTotal >= nextTier.cost) {
                    let perksToAssign = [];
                    let allPerksForTier = await localFunctions.getFullPerksOfTierWNR(localFunctions.premiumToInteger(nextTier.name));
                    for (let perk of allPerksForTier) {
                        perksToAssign.push(perk);
                    }
                    userTier.name = nextTier.name;
                    userTier.id = nextTier.roleId;
                    await pendingMember.roles.remove(fullTier.roleId);
                    await pendingMember.roles.add(nextTier.roleId);
                    await pendingMember.roles.add('743505566617436301');
                    await localFunctions.setUserTier(userId, userTier, collection);
                    await localFunctions.setPerks(userId, perksToAssign, collection);
                    console.log(`Tier upgrade has been executed due to monthly support renewal for ${int.user.tag}.`);
                    await int.editReply({
                        content: 'Your payment has been verified and your tier has been upgraded! Thank you for your renewal <3, check your new status using /collabs premium.'
                    });
                } else {
                    if (fullTier.generalRenewalPrice === null || userSubData.total >= fullTier.generalRenewalPrice) {
                        let perksToAssign = [];
                        let allPerksForTier = await localFunctions.getFullPerksOfTier(localFunctions.premiumToInteger(userTier.name));
                        for (let perk of allPerksForTier) {
                            perksToAssign.push(perk);
                        }
                        await localFunctions.setPerks(userId, perksToAssign, collection);
                        console.log(`Full renewal of perks has been executed due to monthly support renewal for ${int.user.tag}.`);
                    }
                    await int.editReply({
                        content: 'Your payment has been verified! Thank you for your renewal <3, check your new status using /collabs premium.'
                    });
                }
                const premiumLogChannel = guild.channels.cache.get('1195256632318365746');
                premiumLogChannel.send({ content: '', embeds: [subLogEmbed] });
                await localFunctions.liquidatePaymentData(email, collectionPayments);
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
