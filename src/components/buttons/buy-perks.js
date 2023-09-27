const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'buy-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");

        try {
            const staticTier = await localFunctions.getUserTier(userId, collection) || [];
            let userTier = staticTier;
            let renewalPrice = '';
            try {
                for (const numeral of localConstants.romanNumerals) {
                    const roleToFind = `Mirage ${numeral}`;
                    if (roleToFind === userTier.name) {
                        userTier = localFunctions.romanToInteger(numeral);
                    }
                }
            } catch {
                userTier = 0;
                console.log('User is not supporter.')
            }
            const userPerks = await localFunctions.getPerks(userId, collection);
            let allPerks = [];
            for (const tiers of localConstants.premiumTiers) {
                for (const perks of tiers.perks) {
                    allPerks.push(perks);
                }
            }
            const purchaseablePerks = allPerks.filter(obj => !userPerks.some(perk => perk.name === obj.name));

            if (userTier != 0) {
                const fullTier = localConstants.premiumTiers.find(obj => obj.name === staticTier.name);
                const tierRenewal = fullTier.generalRenewalPrice;
                renewalPrice = `__**Renewal**__ price for all perks: ${tierRenewal}$`;
            } else {
                renewalPrice = ``;
            }

            const perksEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor('#f26e6a')
                .setAuthor({ name: `💎 Welcome to the perk shop ${int.user.tag}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setThumbnail(int.user.displayAvatarURL())
                .addFields(
                    {
                        name: `**Current Tier: ${staticTier.name}**\n${renewalPrice}`,
                        value: `\`\`\`💵 Renewable and Purchaseable Perks\`\`\``,
                    }
                )

            if (purchaseablePerks.length !== 0) {
                let buyMenu = new SelectMenuBuilder()
                    .setCustomId('buy-perks-menu')
                    .setPlaceholder('Choose the perks you want to purchase.') 
                    .setMinValues(1)

                for (const perk of purchaseablePerks) {
                    if (perk.renewalPrice && (userTier >= perk.tier)) {
                        perksEmbed.addFields(
                            {
                                name: `‎`,
                                value: `\`\`✒️ ${perk.name}\`\`
                             [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                             └ Renewal cost: ${perk.renewalPrice}$`,
                            }
                        )
                        buyMenu.addOptions({ label: perk.name, value: `${perk.name} - ${perk.renewalPrice}`, description: `Renewal cost: ${perk.renewalPrice}$` });
                    } else if (perk.individualPrice && (perk.tier > userTier)) {
                        perksEmbed.addFields(
                            {
                                name: `‎`,
                                value: `\`\`✒️ ${perk.name}\`\`
                             [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                             └ Purchase cost: ${perk.individualPrice}$`,
                            }
                        )
                        buyMenu.addOptions({ label: perk.name, value: `${perk.name} - ${perk.individualPrice}`, description: `Purchase cost: ${perk.individualPrice}$` });
                    }
                }
                buyMenu.setMaxValues(buyMenu.options.length);
                const Components = new ActionRowBuilder().addComponents(buyMenu);
                int.editReply({
                    content: '',
                    embeds: [perksEmbed],
                    components: [Components],
                });
            } else {
                perksEmbed.addFields(
                    {
                        name: `‎`,
                        value: `\`\`✒️ You have all the perks! How awesome\`\``,
                    }
                )
                int.editReply({
                    content: '',
                    embeds: [perksEmbed],
                });
            }
        } finally {
            mongoClient.close();
        }
    }
}