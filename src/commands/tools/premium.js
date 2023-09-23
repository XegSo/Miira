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
        await int.deferReply({ ephemeral: true });
        let foundRole = null;
        let singleUse = '';
        let tierString = '**No premium status found!**'
        for (const numeral of localConstants.romanNumerals) {
            const roleToFind = `Mirage ${numeral}`;
            foundRole = int.member.roles.cache.find(role => role.name === roleToFind);

            if (foundRole) {
                const foundTier = {
                    name: foundRole.name,
                    id: foundRole.id
                };
                tierString = `**Current Tier: ${foundTier.name}**`;
                break;
            }
        }

        const username = int.user.tag;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        try {
            let userPerks = await localFunctions.getPerks(int.user.id, collection);
            let startingDecayDate = await localFunctions.getPerkStartingDecayDate(collectionSpecial);
            let mainComponents = [];
            let userTier = await localFunctions.getUserTier(int.user.id, collection);

            const premiumEmbed = new EmbedBuilder()
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .setColor('#f26e6a')

            if (userPerks) {
                premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                premiumEmbed.setDescription(`${tierString}\n\`\`\`✅ Perks available to claim!\`\`\``)

                for (const perk of userPerks) {
                    if (perk.singleUse) {
                        singleUse = '\n ├ This perk can only be used **in one collab**!';
                    } else {
                        singleUse = '';
                    }
                    premiumEmbed.addFields({
                        name: ` `, 
                        value: `\`\`🎫 ${perk.name}\`\`
                             ├ [What is this?](https://discord.com/channels/630281137998004224/767374005782052864)
                             ├ Use the dropdown menu bellow to claim your perk.${singleUse}
                             └ Your current renewal price is ${perk.renewalPrice}$.` });
                }
                mainComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('premium-info')
                        .setLabel('⏏️ Premium Info')
                        .setStyle('Primary'),
                )

            } else if (roles.includes("Premium")) {
                if (!userTier) {
                    localFunctions.setUserTier(int.user.id, foundTier, collection);
                }
                premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                premiumEmbed.setDescription(`${tierString}\n\`\`\`⚠️ No perks available to claim!\`\`\``)
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew any of your perks.\n └ Your role will decay on <t:${startingDecayDate}:R>.` })
                mainComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('premium-info')
                        .setLabel('⏏️ Renew Here')
                        .setStyle('Primary'),
                )
            } else {
                premiumEmbed.setDescription('\`\`\`🚀 Welcome to the premium section!\`\`\`\n**In this section, you can find information about the current premium tiers and their perks!**\n\n• The perks are **accumulative**. \n• After one collab, most perks will need to be **renewed**. \n• If there is no renewal, there is a decay into *former supporter*.\n• You can also purchase **single perks** for single use in collabs.\n• Premium includes bump immunity.\n\nOnly the **prominent** perks are mentioned for each tier on this embed.');
                premiumEmbed.addFields(
                    { name: ` `, value: `\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version.` },
                    { name: ` `, value: `\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner.` },
                    { name: ` `, value: `\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay.` },
                    { name: ` `, value: `\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n` },
                    { name: ` `, value: `\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin.` },
                    { name: ` `, value: `\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access.` },
                    { name: ` `, value: `\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab.\n\n **You can find the full information about each tier in the list bellow.**` },
                );

                mainComponents = new ActionRowBuilder().addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('premium-tiers')
                        .setPlaceholder('Check the detailed tiers.')
                        .addOptions([
                            { label: 'Mirage I', value: 'Mirage I', description: 'Cost: 5$' },
                            { label: 'Mirage II', value: 'Mirage II', description: 'Cost: 10$' },
                            { label: 'Mirage III', value: 'Mirage III', description: 'Cost: 15$' },
                            { label: 'Mirage IV', value: 'Mirage IV', description: 'Cost: 20$' },
                            { label: 'Mirage V', value: 'Mirage V', description: 'Cost: 40$' },
                            { label: 'Mirage VI', value: 'Mirage VI', description: 'Cost: 100$' },
                            { label: 'Mirage VII', value: 'Mirage VII', description: 'Cost: 250$' },
                        ])
                )
            }

            int.editReply({
                content: '',
                embeds: [premiumEmbed],
                components: [mainComponents],
            });

        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}