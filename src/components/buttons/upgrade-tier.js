const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const upgradeCache = new Map();

module.exports = {
    data: {
        name: 'upgrade-tier'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        let arrayOfObjects = [];
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
                .setDescription(`\`\`\`🚀 Upgrade your tier\`\`\`\n • Bellow you can find the tiers your can upgrade to with their prices adapted to your current tier.\n • By upgrading, you will get all of the perks of the tier and the ones bellow renewed.`)

            if (upgradeablePerks.length !== 0) {
                let buyMenu = new SelectMenuBuilder()
                    .setCustomId('add-content-to-cart')
                    .setPlaceholder('Choose the tier you want to upgrade to.')  

                for (const tier of upgradeablePerks) {
                        tiersEmbed.addFields(
                            {
                                name: `‎`,
                                value: `\`\`✒️ ${tier.name}\`\`
                             [├](https://discord.com/channels/630281137998004224/767374005782052864) ${tier.description}
                             └ **Upgrade cost: ${tier.cost-fullTier.cost}$**`,
                            }
                        )
                        buyMenu.addOptions({ label: tier.name, value: `${tier.name}`, description: `Upgrade cost: ${tier.cost-fullTier.cost}$` });
                        arrayOfObjects.push({ name: tier.name, type: 'Upgrade', price: tier.cost-fullTier.cost });
                }
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

            upgradeCache.set(int.user.id, {
                choices: arrayOfObjects,
            });
        } finally {
            mongoClient.close();
        }
    },
    upgradeCache: upgradeCache
}