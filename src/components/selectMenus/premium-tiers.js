const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');

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
            .setDescription(`\`\`\`🚀 ${selectedTier.name}\`\`\`\n • ${selectedTier.description}${decayString}`)

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
                value: `\`\`\`💵 Pricing\`\`\`\n`,
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
                value: `\`\`\`🎫 Perks\`\`\`\n`,
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
                value: `\`\`\`✅ Extras\`\`\`\n • ${selectedTier.extra}\n‎`
            }
        )

        tierEmbed.setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' });
        tierEmbed.setTimestamp()

        buyComponent = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('premium-buy')
                .setLabel('⏏️ Purchase.')
                .setStyle('Primary'),

        )

        listComponent = new ActionRowBuilder().addComponents(
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

        int.editReply({
            content: '',
            embeds: [tierEmbed],
            components: [listComponent, buyComponent],
            ephemeral: true
        });
    },
};