const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Endless Mirage Premium Pannel.'),
    async execute(int, client) {
        await int.deferReply();
        const roles = int.member.roles.cache.map(role => role.name);
        const username = int.user.tag;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        try {
            let userPerks = await localFunctions.getPerks(int.user.id, collection);
            let startingDecayDate = await localFunctions.getPerkStartingDecayDate(collectionSpecial);
            let mainComponents = [];
            let extraComponents = [];

            const premiumEmbed = new EmbedBuilder()
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .setColor('#f26e6a')

            if (roles.includes("Premium")) {
                if (roles.includes("Mirage I")) {
                    const perkOne = userPerks.find((item) => item.name === 'Perk I')
                    if (perkOne) {
                        premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                        premiumEmbed.setDescription('**Current Tier: Mirage I**\n\`\`\`✅ Perks available to claim!\`\`\`')
                        premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Tier I Perk\`\`\n ├ You can claim your [Perk I](https://discord.com/channels/630281137998004224/767374005782052864).\n ├ Use the button bellow to claim your perk.\n └ Your current renewal price is 2$.` });
                        mainComponents = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('premium-info')
                                .setLabel('⏏️ Premium Info')
                                .setStyle('Primary'),
                        )
                        
                    } else {
                        premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                        premiumEmbed.setDescription('**Current Tier: Mirage I**\n\`\`\`⚠️ No perks available to claim!\`\`\`')
                        premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew your perk.\n ├ Your current renewal price is 2$.\n └ Your role will decay on <t:${startingDecayDate}:R>.` })
                        mainComponents = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('buy-one')
                                .setLabel('🔄 Buy Perk I')
                                .setStyle('Primary'),
                            new ButtonBuilder()
                                .setCustomId('premium-info')
                                .setLabel('⏏️ Premium Info')
                                .setStyle('Primary'),    
                        )
                    }
                }
            } else {
                premiumEmbed.setDescription('\`\`\`🚀 Welcome to the premium section!\`\`\`\n**In this section, you can find information about the current premium tiers and their perks!**\n\n• The perks are accumulative and the starter ones are valid for one collab. \n• After one collab, the perks will need to be renewed. \n• If there is no renewal, there is a decay into *former supporter* and the renewal prices won\'t be able to be used anymore unless premium is purchased again.\n• You can also purchase single perks for single use in collabs.\n• Premium includes bump immunity.\n**Renewal prices are per perk.**');
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage I Premium | Price: 5$\`\`\n ├ Exclusive profile picture version.\n ├ **More..**\n ├ **Single perk price: 5$**.\n └ **Renewal: 2$.**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage II Premium | Price: 10$\`\`\n ├ Animated Banner.\n ├ **More..**\n ├ **Single perk price: 10$**\n └ **Renewal: 2$.**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage III Premium | Price: 15$\`\`\n ├ Animated Stream Overlay.\n ├ **More..**\n ├ **Single perk price: 15$**\n └ **Renewal: 2$.**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n ├ Early collab delivery.\n ├ No premium decay.\n ├ **Single perk price: 10$**\n └ **Renewal: Permanent.**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage V Premium | Price: 40$\`\`\n ├ Customized collab themed osu! skin.\n ├ **More..**\n ├ **Single perk (skin) price: 20$**\n ├ **Single perk (extra mats) price: 20$**\n ├ **Skin Renewal: 6$**.\n └ **Extra Materials Renewal: 6$**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n ├ Collab early access.\n ├ **More..**\n ├ **Single perk price: 60$**\n └ **Renewal: 10$.**` });
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n ├ All perks become permanent.\n ├ **More..**\n ├ **Single perk (hoodie) price: 30$**\n ├ **Single perk (megacollab) price: 100$**\n └ **Megacollab hosting: Single use.**\n\n **You can find more information about each role by pressing the buttons bellow.**` });
                mainComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('info-one')
                        .setLabel('1️⃣')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('info-two')
                        .setLabel('2️⃣')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('info-tree')
                        .setLabel('3️⃣')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('info-four')
                        .setLabel('4️⃣')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('info-five')
                        .setLabel('5️⃣')
                        .setStyle('Primary'),
                )
                extraComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('info-six')
                        .setLabel('6️⃣')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('info-seven')
                        .setLabel('7️⃣')
                        .setStyle('Primary'),
                )
            }

            if (extraComponents) {
                int.editReply({
                    content: '',
                    embeds: [premiumEmbed],
                    components: [mainComponents, extraComponents]
                });
            } else {
                int.editReply({
                    content: '',
                    embeds: [premiumEmbed],
                    components: [mainComponents]
                });
            }

        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}