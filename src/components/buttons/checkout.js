const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');


module.exports = {
    data: {
        name: 'checkout'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        let totalCost = 0;
        const collection = client.db.collection('Users');
        const checkoutEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp();

        let checkoutItems = await localFunctions.getCart(userId, collection);
        if (checkoutItems.length) {
            checkoutEmbed.setDescription('**```prolog\n💎 Your Payment link is ready!```**\n*At the moment, we only support PayPal and Ko-fi Payments.*');
            for (let item of checkoutItems) {

                totalCost = totalCost + item.price;
            }
            await localFunctions.setCurrentPendingPayment(userId, totalCost, collection);
            checkoutEmbed.addFields(
                {
                    name: `**\`\`💳 Amount to pay: ${totalCost}$\`\`**`,
                    value: 'Once the Payment is **completed**, press the **Verify Payment** Button for verification and asignation of your items.'
                }
            );
            let checkoutComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('💳 PayPal')
                    .setURL(`${localConstants.paypal}${totalCost}`)
                    .setStyle('Link'),
                new ButtonBuilder()
                    .setLabel('💳 Ko-Fi')
                    .setURL(`${localConstants.kofi}${totalCost}`)
                    .setStyle('Link'),
                new ButtonBuilder()
                    .setCustomId('verify-payment')
                    .setLabel('✅ Verify Payment')
                    .setStyle('Success')
            );
            checkoutEmbed.addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                }
            );
            await int.editReply({
                content: '',
                embeds: [checkoutEmbed],
                components: [checkoutComponents]
            });
        } else {
            await int.editReply('Something went wrong...');
        }
    }
};
