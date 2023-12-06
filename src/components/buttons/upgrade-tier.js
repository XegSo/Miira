const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: 'upgrade-tier'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");

        try {
            const staticTier = await localFunctions.getUserTier(userId, collection) || [];
            let userTier = staticTier;
            const fullTier = localConstants.premiumTiers.find(obj => obj.name === staticTier.name);
            for (const numeral of localConstants.romanNumerals) {
                const roleToFind = `Mirage ${numeral}`;
                if (roleToFind === userTier.name) {
                    userTier = localFunctions.romanToInteger(numeral);
                }
            }
            let upgradeablePerks = [];
            for (const tiers of localConstants.premiumTiers) {
                if (tiers.id > userTier) {
                    upgradeablePerks.push(tiers)
                }
            }

            const tiersEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor('#f26e6a')
                .setAuthor({ name: `💎 Welcome to the tier upgrade section ${int.user.tag}!`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setThumbnail(int.user.displayAvatarURL())
                .addFields(
                    {
                        name: `**Current Tier: ${staticTier.name}**\n`,
                        value: `\`\`\`💵 Purchaseable Tiers\`\`\``,
                    }
                )

            if (upgradeablePerks.length !== 0) {
                let buyMenu = new SelectMenuBuilder()
                    .setCustomId('buy-tier-menu')
                    .setPlaceholder('Choose the tier you want to upgrade to.') 
                    .setMinValues(1)

                for (const tier of upgradeablePerks) {
                        tiersEmbed.addFields(
                            {
                                name: `‎`,
                                value: `\`\`✒️ ${tier.name}\`\`
                             [├](https://discord.com/channels/630281137998004224/767374005782052864) ${tier.description}
                             └ Upgrade cost: ${tier.cost-fullTier.cost}$`,
                            }
                        )
                        buyMenu.addOptions({ label: tier.name, value: `${tier.name} - ${tier.cost}`, description: `Updrade cost: ${tier.cost-fullTier.cost}$` });
                }
                buyMenu.setMaxValues(buyMenu.options.length);
                const Components = new ActionRowBuilder().addComponents(buyMenu);
                int.editReply({
                    content: '',
                    embeds: [tiersEmbed],
                    components: [Components],
                });
            } else {
                tiersEmbed.addFields(
                    {
                        name: `‎`,
                        value: `\`\`✒️ You have the peak tier!\`\``,
                    }
                )
                int.editReply({
                    content: '',
                    embeds: [tiersEmbed],
                });
            }
        } finally {
            mongoClient.close();
        }
    }
}