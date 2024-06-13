const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const localConstants = require('../../constants');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createpremiumembeds')
        .setDescription('Creates the embeds for the premium channel (Admin only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(int) {
        if (int.user.id !== '687004886922952755') return;
        await int.deferReply({ ephemeral: true });
        const premiumChannel = int.guild.channels.cache.get('767374005782052864');
        const mainEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setDescription('**```ml\n 🚀 Welcome to the premium section!```**\n**In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>')
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' });
        let tierEmbeds = [];
        let deluxeEntry = 'Free.';
        let deluxeExtra = 'Free.';
        let renewalPrice = 'No.';
        let resString = '\u200B';
        let priceString = '\u200B';
        let decayString = '';

        for (let tier of localConstants.premiumTiers) {

            if (tier.decay) {
                decayString = '\n⚠️__***This tier decays.***__';
            } else {
                decayString = '';
            }

            let tierEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setDescription(`**\`\`\`ml\n🚀 ${tier.name}\`\`\`**\n • ${tier.description}${decayString}`);

            if (tier.generalRenewalPrice) {
                renewalPrice = `${tier.generalRenewalPrice}$`;
            } else {
                renewalPrice = 'No.';
            }

            if (tier.deluxePrice) {
                deluxeEntry = `${tier.deluxePrice}$`;
                deluxeExtra = `${tier.deluxeExtraPrice}$`;
            } else {
                deluxeEntry = 'Free.';
                deluxeExtra = 'Free.';
            }

            tierEmbed.addFields(
                {
                    name: '‎',
                    value: '**```ml\n💵 Pricing```**\n'
                },
                {
                    name: '\u200B',
                    value: `• **__Price__: ${tier.cost}$**\n• **__Renewal__: ${renewalPrice}**`,
                    inline: true
                },
                {
                    name: '\u200B',
                    value: `• **__DX Collab Entry__: ${deluxeEntry}**\n• **__DX Extra Mats__: ${deluxeExtra}**`,
                    inline: true
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                },
                {
                    name: '‎                                      *└DX Stands for Deluxe Collabs*',
                    value: '**```ml\n🎫 Perks```**\n'
                },
                {
                    name: '*Renewing this tier renews all of the perks (Including previous tiers).*\n*You can renew individual perks or buy perks if you\'re not supporter.*\n',
                    value: '\u200B'
                }
            );

            for (const perk of tier.perks) {
                if (perk.restrictions) {
                    resString = `‎          💬__ *${perk.restrictions}*__`;
                } else {
                    resString = '‎          💬__ *This perk has no restrictions!*__';
                }

                if (perk.singleUse) {
                    if (perk.renewalPrice && perk.individualPrice) {
                        priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__        └💵__ Price: ${perk.individualPrice}$__        🛑__** Single use perk.**__`;
                    } else if (perk.renewalPrice) {
                        priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__                                   🛑__** Single use perk.**__`;
                    } else if (perk.individualPrice) {
                        priceString = `\n‎        └💵__ Price: ${perk.individualPrice}$__                                       🛑__** Single use perk.**__`;
                    }
                } else {
                    if (perk.renewalPrice && perk.individualPrice) {
                        priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__        └💵__ Price: ${perk.individualPrice}$__`;
                    } else if (perk.renewalPrice) {
                        priceString = `\n‎        └💵__ Renewal: ${perk.renewalPrice}$__`;
                    } else if (perk.individualPrice) {
                        priceString = `\n‎        └💵__ Price: ${perk.individualPrice}$__`;
                    } else {
                        priceString = '\u200B';
                    }
                }

                tierEmbed.addFields(
                    {
                        name: `\`\`✒️ ${perk.name}\`\``,
                        value: `‎  • ${perk.description}${priceString}`
                    },
                    {
                        name: resString,
                        value: '‎'
                    }
                );
            }

            tierEmbed.addFields({
                name: '‎',
                value: `**\`\`\`ml\n✅ Extras\`\`\`**\n • ${tier.extra}\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`
            });

            tierEmbeds.push(tierEmbed);
        }

        await premiumChannel.send({
            embeds: [mainEmbed]
        });

        let buyComponent = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('premium-buy')
                .setLabel('⏏️ Purchase')
                .setStyle('Primary')
        );

        for (let embed of tierEmbeds) {
            await premiumChannel.send({
                embeds: [embed],
                components: [buyComponent]
            });
        }

        await int.editReply('Done!');
    }
};
