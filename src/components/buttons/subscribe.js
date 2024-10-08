const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'subscribe'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('Users');
        const userId = int.user.id;
        let renewalString = '';
        const currentDate = new Date();
        let nextMonth = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        if (nextMonth === 12) {
            nextMonth = 1;
            year += 1;
        } else {
            nextMonth += 1;
        }

        const formattedMonth = nextMonth.toString().padStart(2, '0');

        let buyEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setAuthor({ name: `Welcome to the subscription dashboard ${int.user.tag}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
            .setFooter({ text: 'Endless Mirage | Subscription Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' });

        let subStatus = await localFunctions.getUserMontlyPremium(userId, collection);
        if (subStatus) {
            let dbTier = await localFunctions.getTier(userId, collection);
            let fullTier = 0;
            let fullTierRenewal = 0;
            if (dbTier.length !== 0) {
                fullTier = localConstants.premiumTiers.find((e) => e.name === dbTier.name);
                fullTierRenewal = fullTier.generalRenewalPrice;
            }
            if (fullTierRenewal) {
                if (parseInt(subStatus.total) >= fullTierRenewal) {
                    renewalString = '**\nRenewing your subscription will make you renew all of your perks! How awesome**';
                } else {
                    renewalString = `Current amount pending for permanent perk renewal = ${fullTierRenewal - parseInt(subStatus.total)}$`;
                }
            } else if (fullTierRenewal !== 0) {
                renewalString = 'Your perks are renewed because of your current Mirage Tier! Thank you for supporting us despite the fact of having the peak tier <3';
            } else {
                renewalString = '';
            }

            let buyComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sub-restart')
                    .setLabel('💵 Renew')
                    .setStyle('Success')
            );
            buyEmbed.setDescription(`**Current Tier: ${dbTier.name}**`);

            const startingDateParts = subStatus.startingDate.split('/');
            const lastPaymentParts = subStatus.lastDate.split('/');

            const startingDate = new Date(startingDateParts[2], startingDateParts[1] - 1, startingDateParts[0]);
            const lastPayment = new Date(lastPaymentParts[2], lastPaymentParts[1] - 1, lastPaymentParts[0]);

            const monthsDiff = (lastPayment.getFullYear() - startingDate.getFullYear()) * 12 + lastPayment.getMonth() - startingDate.getMonth();
            buyEmbed.addFields(
                {
                    name: ' ',
                    value: `**\`\`\`prolog\n💵 Subscription Info\`\`\`**\n**Current Donated Amount:** ${subStatus.total}$\n**Current Monthly Amount:** ${subStatus.currentAmount}$\n**Starting Date:** ${subStatus.startingDate}\n**Last Payment:** ${subStatus.lastDate}\n**Total Months:** ${subStatus.months ? subStatus.months : monthsDiff}\n${renewalString}\nNext Payment Window: ${localConstants.startingSubDay}/${formattedMonth}/${year} - ${localConstants.finalSubDay}/${formattedMonth}/${year}`
                }
            );

            buyEmbed.addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                }
            );
            await int.editReply({
                content: '',
                embeds: [buyEmbed],
                components: [buyComponents]
            });
        } else {
            buyEmbed.setDescription('**```💎 About Subscribing```**\nSubscriptions are another way of supporting us and hitting premium milestones, without having to pay all of the money in a single go. There are benefits to this, which are the following:\n\n**1.** Whenever your total given amount exceeds the renewal amount of your current tier, you will get a renewal of your perks everytime you perform a payment.\n\n**2.** You can use a monthly amount ranging from 5 dollars to infinite. Whenever you hit a total amount that matches the price of a tier, you will upgrade to that tier.\n\n**3.** You will obtain free access to all the deluxe collabs hosted by us, including the extra materials.');
            buyEmbed.addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                }
            );
            let buyComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sub-new')
                    .setLabel('💵 Subscribe')
                    .setStyle('Success')
            );
            await int.editReply({
                content: '',
                embeds: [buyEmbed],
                components: [buyComponents]
            });
        }
    }
};
