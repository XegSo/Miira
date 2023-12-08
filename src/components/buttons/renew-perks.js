const { EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const renewalCache = new Map();

module.exports = {
    data: {
        name: 'renew-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { connectToMongoDB } = require('../../mongo');
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        let renewablePerks = [];
        let currentTier = [];
        var arrayOfObjects = [];
        try {
            const userTier = await localFunctions.getUserTier(userId, collection);
            for (const tier of localConstants.premiumTiers) {
                for (const perk of tier.perks) {
                    if (perk.renewalPrice) {
                        renewablePerks.push(perk);
                    }
                }
                if (tier.name === userTier.name) {
                    currentTier = tier;
                    break;
                }
            }
            const renewalEmbed = new EmbedBuilder()
                .setAuthor({ name: `Renewal dashboard`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setThumbnail(int.user.displayAvatarURL())
                .setTimestamp()
                .setColor('#f26e6a')
                .addFields({
                    name: `Current Tier: ${currentTier.name}\n*Renewal price for all perks: ${currentTier.generalRenewalPrice}$*`,
                    value: `\`\`\`↪️ Perks available for renewal\`\`\``
                })
            let renewMenu = new SelectMenuBuilder()
                .setCustomId('add-content-to-cart')
                .setPlaceholder('Choose the perks you want to renew.')
                .addOptions({
                    label: `${currentTier.name}`,
                    value: `${currentTier.name}`,
                    description: `Renew all the perks for ${currentTier.generalRenewalPrice}$`,
                })

            arrayOfObjects.push({ name: currentTier.name, type: "Renewal", price: currentTier.generalRenewalPrice })    

            for (const perk of renewablePerks) {
                renewalEmbed.addFields({
                    name: ` `,
                    value: `\`\`✒️ ${perk.name}\`\`
                         [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                         ├ Use the dropdown menu bellow to renew this perk.
                         └ Renewal price: __**${perk.renewalPrice}$**__`
                });
                renewMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                arrayOfObjects.push({ name: perk.name, type: "Renewal", price: perk.renewalPrice });
            }

            renewMenu.setMaxValues(renewMenu.options.length);

            renewalCache.set(int.user.id, {
                choices: arrayOfObjects,
            });

            const Components = new ActionRowBuilder().addComponents(renewMenu);

            int.editReply({
                content: '',
                embeds: [renewalEmbed],
                components: [Components],
            });

        } finally {
            mongoClient.close();
        }
    },
    renewalCache: renewalCache
}