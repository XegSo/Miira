const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { fetchCache } = require('../modals/fetch-profile')
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'verify-osu'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
        try {
            let verificationCode = 0;
            let osu_user_full = [];
            if (fetchCache.size !== 0) {
                osu_user_full = fetchCache.get(userId).osu_user;
            }
            const osu_user = localFunctions.removeFields(osu_user_full, localConstants.unnecesaryFieldsOsu);
            const blacklistCheck = await localFunctions.getBlacklistOsuId(osu_user.id, blacklistCollection)
            if (blacklistCheck) return await int.editReply('You cannot link this account because you\'re blacklisted from the collabs.')
            const currentData = await localFunctions.getVerificationData(userId, collection);
            if (currentData.length === 0) {
                verificationCode = localFunctions.generateRandomCode();
                const verification = {
                    user: osu_user,
                    code: verificationCode
                }
                await localFunctions.setVerificationData(userId, verification, collection);
            } else if (currentData.user.id !== osu_user.id) {
                verificationCode = localFunctions.generateRandomCode();
                const verification = {
                    user: osu_user,
                    code: verificationCode
                }
                await localFunctions.setVerificationData(userId, verification, collection);
            } else {
                verificationCode = currentData.code;
            }
            const components = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🔗 Send code')
                    .setURL('https://osu.ppy.sh/home/messages/users/8143504')
                    .setStyle('Link'),
            )
            const dashboardEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Link your osu! Account', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`ml\n📌 Last Step\`\`\`**\nCopy the following verification code and click on the button. Once the chat opens, **send the code only**.\n\n**\`\`\`ml\n${verificationCode}\`\`\`**`)
                .addFields(
                    {
                        name: "*If there is no reply in the PM, try again in a few minutes.*",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    }
                );
            await int.editReply({
                embeds: [dashboardEmbed],
                components: [components]
            })
        } finally {
            mongoClient.close();
            mongoClientBlacklist.close();
        }
    },
}