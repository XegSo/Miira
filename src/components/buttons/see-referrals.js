const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { users } = require('osu-api-extended/dist/api/v2');

module.exports = {
    data: {
        name: 'see-referrals'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collection = client.db.collection('OzenCollection');
        const collabCollection = client.db.collection('Collabs');

        try {
            const referralCode = await localFunctions.getUserReferral(userId, collection);
            if (!referralCode) return int.editReply('You don\'t have a referral code...');
            const allCollabs = await localFunctions.getCollabs(collabCollection);
            const megacollabs = await allCollabs.filter(c => c.restriction === 'megacollab');
            let referredUsers = [];
            for (const collab of megacollabs) {
                let participants = collab.participants;
                if (typeof participants !== 'undefined') {
                    let invitedUsers = participants.filter(p => p.referral === referralCode);
                    if (typeof invitedUsers !== 'undefined') {
                        referredUsers = referredUsers.concat(invitedUsers);
                    }
                }
            }
            if (referredUsers.length === 0) return int.editReply('You have not invited any users to any collab yet!');

            const invitedUsersEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Referred users', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setTimestamp()
                .setDescription('**```ml\nHere you can check all of the users you\'ve ever invited!```**                                                                                                        \n');

            let userString = '';
            for (const [i, invitedUser] of referredUsers.entries()) {
                userString = userString.concat(`-**<@${invitedUser.discordId}>**\n-**Joined <t:${invitedUser.joinDate}:R>**\n-**${invitedUser.collabName}**\n\n`);
                if (userString.length > 900 || i === referredUsers.length - 1) {
                    invitedUsersEmbed.addFields({
                        name: '‎',
                        value: userString,
                        inline: true
                    });
                    userString = '';
                }
            }
            invitedUsersEmbed.addFields(
                {
                    name: '‎',
                    value: '<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>'
                }
            );
            int.editReply({ embeds: [invitedUsersEmbed] });

        } catch (e) {
            console.log(e);
        }
    }
};
