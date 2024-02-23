const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'sub-renew'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const checkoutEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp();
        try {
            const user = await localFunctions.getUser(userId, collection);
            if (!user) {
                return await int.editReply('You can not perform this action.');
            } else if (typeof user.monthlyDonation === "undefined") {
                return await int.editReply('You can not perform this action.');
            } else if (user.monthlyDonation.status === "paid") {
                return await int.editReply('You already payed this month!');
            }
            let amountToPay = parseInt(user.monthlyDonation.currentAmount);
            checkoutEmbed.setDescription("**\`\`\`prolog\n💎 Your Payment link is ready!\`\`\`**\n*At the moment, we only support PayPal and Ko-fi Payments.*")
            checkoutEmbed.addFields(
                {
                    name: `**\`\`💳 Amount to pay: ${amountToPay}$\`\`**`,
                    value: "Once the Payment is **completed**, press the **Verify Payment** Button for verification and renewal of your subscription status.",
                },
            )

            let checkoutComponents = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('💳 PayPal')
                    .setURL(`${localConstants.paypal}${amountToPay}`)
                    .setStyle('Link'),
                new ButtonBuilder()
                    .setLabel('💳 Ko-Fi')
                    .setURL(`${localConstants.kofi}${amountToPay}`)
                    .setStyle('Link'),
                new ButtonBuilder()
                    .setCustomId('verify-payment-sub')
                    .setLabel('✅ Verify Payment')
                    .setStyle('Success'),
            )
            checkoutEmbed.addFields(
                {
                    name: "‎",
                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                }
            )
            await int.editReply({
                content: '',
                embeds: [checkoutEmbed],
                components: [checkoutComponents],
            });
        } catch (e) {
            console.log(e);
        } finally {
            mongoClient.close();
        }
    }
}