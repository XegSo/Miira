const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const selectionTier = new Map();

module.exports = {
    data: {
        name: 'premium-tiers'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const tierName = int.values[0]; // Get the selected item from the dropdown
        const selectedTier = localConstants.premiumTiers.find((tier) => tier.name === tierName);
        if (!tierName || !selectedTier) return;
        selectionTier.set(int.user.id, {
            tier: selectedTier,
        });

        let deluxeEntry = 'Free.';
        let deluxeExtra = 'Free.';
        let renewalPrice = 'No.';
        let resString = '\u200B';
        let priceString = '\u200B';
        let decayString = '';

        if (selectedTier.decay) {
            decayString = `\n⚠️__***This tier decays.***__`;
        }

        let tierEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setDescription(`**\`\`\`ml\n🚀 ${selectedTier.name}\`\`\`**\n • ${selectedTier.description}${decayString}`)

        if (selectedTier.generalRenewalPrice) {
            renewalPrice = `${selectedTier.generalRenewalPrice}$`;
        }

        if (selectedTier.deluxePrice) {
            deluxeEntry = `${selectedTier.deluxePrice}$`;
            deluxeExtra = `${selectedTier.deluxeExtraPrice}$`;
        }

        tierEmbed.addFields(
            {
                name: '‎',
                value: `**\`\`\`ml\n💵 Pricing\`\`\`**\n`,
            },
            {
                name: '\u200B',
                value: `• **__Price__: ${selectedTier.cost}$**\n• **__Renewal__: ${renewalPrice}**`,
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
                value: `**\`\`\`ml\n🎫 Perks\`\`\`**\n`,
            },
            {
                name: '*Renewing this tier renews all of the perks (Including previous tiers).*\n*You can renew individual perks or buy perks if you\'re not supporter.*\n',
                value: '\u200B',
            },
        )

        for (const perk of selectedTier.perks) {
            if (perk.restrictions) {
                resString = `‎          💬__ *${perk.restrictions}*__`;
            } else {
                resString = `‎          💬__ *This perk has no restrictions!*__`;
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
                    value: `‎`
                },
            );
        }

        tierEmbed.addFields(
            {
                name: `‎`,
                value: `**\`\`\`ml\n✅ Extras\`\`\`**\n • ${selectedTier.extra}\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`
            }
        )

        const buyComponent = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('premium-buy')
                .setLabel('⏏️ Purchase')
                .setStyle('Primary'),

        )

        const listComponent = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('premium-tiers')
                .setPlaceholder('Check more tiers.')
                .addOptions([
                    { label: 'Mirage I', value: 'Mirage I', description: 'Cost: 5$.' },
                    { label: 'Mirage II', value: 'Mirage II', description: 'Cost: 10$.' },
                    { label: 'Mirage III', value: 'Mirage III', description: 'Cost: 15$.' },
                    { label: 'Mirage IV', value: 'Mirage IV', description: 'Cost: 20$.' },
                    { label: 'Mirage V', value: 'Mirage V', description: 'Cost: 40$.' },
                    { label: 'Mirage VI', value: 'Mirage VI', description: 'Cost: 100$.' },
                    { label: 'Mirage VII', value: 'Mirage VII', description: 'Cost: 250$.' },
                ])
        )

        await int.editReply({
            content: '',
            embeds: [tierEmbed],
            components: [listComponent, buyComponent],
            ephemeral: true
        });
    },
    selectionTier: selectionTier
};