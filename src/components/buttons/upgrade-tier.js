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
                .setColor('#f26e6a')
                .setFooter({ text: 'Endless Mirage | Premium Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setDescription("**\`\`\`ml\n🚀 Upgrade your tier\`\`\`**                                                                                                        **\n • Bellow you can find the tiers your can upgrade to with their prices adapted to your current tier.\n • By upgrading, you will get all of the perks of the tier and the ones bellow renewed.**")

            if (upgradeablePerks.length !== 0) {
                let buyMenu = new SelectMenuBuilder()
                    .setCustomId('add-content-to-cart')
                    .setPlaceholder('Choose the tier you want to upgrade to.')  

                for (const tier of upgradeablePerks) {
                        tiersEmbed.addFields(
                            {
                                name: "‎",
                                value: `\`\`✒️ ${tier.name}\`\`\n └ **Upgrade cost: ${tier.cost-fullTier.cost}$**`,
                                inline: true,
                            }
                        )
                        buyMenu.addOptions({ label: tier.name, value: `${tier.name}`, description: `Upgrade cost: ${tier.cost-fullTier.cost}$` });
                        arrayOfObjects.push({ name: tier.name, type: 'Upgrade', price: tier.cost-fullTier.cost });
                }
                const Components = new ActionRowBuilder().addComponents(buyMenu);
                tiersEmbed.addFields(
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    }
                )
                await int.editReply({
                    content: '',
                    embeds: [tiersEmbed],
                    components: [Components],
                });
            } else {
                tiersEmbed.addFields(
                    {
                        name: "‎",
                        value: "\`\`✒️ You have the peak tier!\`\`",
                    }
                )
                tiersEmbed.addFields(
                    {
                        name: "‎",
                        value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                    }
                )
                await int.editReply({
                    content: '',
                    embeds: [tiersEmbed],
                });
            }

            upgradeCache.set(int.user.id, {
                choices: arrayOfObjects,
            });
            console.log(upgradeCache);
        } finally {
            mongoClient.close();
        }
    },
    upgradeCache: upgradeCache
}