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
        const userId = int.user.id;
        let foundRole = null;
        let renewalPrice = '';
        let decayString = '';
        let ender = '├';
        let tierString = '**No premium status found!**';
        let newPerks = [];
        const roles = int.member.roles.cache.map(role => role.name);
        const username = int.user.tag;
        const tiers = localConstants.premiumTiers;

        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");

        try {
            let userPerks = await localFunctions.getPerks(userId, collection);
            let premiumData = await localFunctions.getPremiumData(collectionSpecial);
            let mainComponents = [];
            let userTier = await localFunctions.getUserTier(userId, collection);

            const premiumEmbed = new EmbedBuilder()
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .setColor('#f26e6a')

            if (!userTier.name && int.member.roles.cache.has('743505566617436301')) {
                console.log('Executing insertion of perks');
                for (const numeral of localConstants.romanNumerals) { //find the role and assign it to the database
                    const roleToFind = `Mirage ${numeral}`;
                    foundRole = int.member.roles.cache.find(role => role.name === roleToFind);

                    if (foundRole) {
                        let tierNumber = localFunctions.romanToInteger(numeral);
                        const foundTier = {
                            name: foundRole.name,
                            id: foundRole.id
                        };
                        await localFunctions.setUserTier(userId, foundTier, collection);
                        tierString = `**Current Tier: ${foundTier.name}**`;
                        if (tierNumber > 3) { //for non renewable tiers, assign the non renewable perks
                            for (const tier of tiers) {
                                for (const perk of tier.perks) {
                                    if ((tierNumber === 7 || tierNumber === 10)) {
                                        newPerks.push(perk);
                                        console.log(`Perk ${perk.name} has been pushed.`)
                                    } else if (!perk.singleUse) {
                                        newPerks.push(perk);
                                        console.log(`Perk ${perk.name} has been pushed.`)
                                    }
                                }
                                if (tier.name === roleToFind) {
                                    await localFunctions.setPerks(userId, newPerks, collection);
                                    console.log(`Perks uploaded.`)
                                    userPerks = newPerks;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            } else {
                tierString = `**Current Tier: ${userTier.name}**`;
            }

            if (userPerks) {
                let useMenu = new SelectMenuBuilder()
                    .setCustomId('use-perks')
                    .setPlaceholder('Use your perks.')

                premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                premiumEmbed.setDescription(`${tierString}`)

                if (userPerks.some(perk => perk.singleUse === false)) {
                    premiumEmbed.addFields(
                        {
                            name: '‎',
                            value: `\`\`\`❇️ Permanent perks\`\`\``,
                        },
                    )
                    for (const perk of userPerks) {
                        if (!perk.singleUse) {
                            premiumEmbed.addFields({
                                name: ` `,
                                value: `\`\`🎫 ${perk.name}\`\`
                                     [└](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}`
                            });
                        }
                    }
                }

                if (userPerks.some(perk => perk.singleUse === true)) {
                    premiumEmbed.addFields(
                        {
                            name: '‎',
                            value: `\`\`\`✅ Perks available to claim!\`\`\``,
                        },
                    )
                    for (const perk of userPerks) {
                        if (perk.singleUse) {
                            if (perk.renewalPrice) {
                                renewalPrice = `\n └ Your current renewal price is ${perk.renewalPrice}$.`;
                            } else {
                                renewalPrice = '';
                                ender = '└';
                            }
                            premiumEmbed.addFields({
                                name: ` `,
                                value: `\`\`🎫 ${perk.name}\`\`
                                     [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}
                                     ├ Use the dropdown menu bellow to use your perk.
                                     ${ender} This perk can only be used **once**!${renewalPrice}`
                            });
                            useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                        }
                    }
                }

                mainComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('premium-info')
                        .setLabel('✒️ Premium Info')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('buy-perks')
                        .setLabel('🔀 Buy more Perks')
                        .setStyle('Primary'),
                )

                if (roles.includes("Premium")) {
                    const upgradeButton = new ButtonBuilder()
                        .setCustomId('upgrade-tier')
                        .setLabel('⏏️ Upgrade your Tier')
                        .setStyle('Primary')
                    mainComponents.addComponents(upgradeButton);
                }

                try {
                    if (useMenu.options[0].data) {
                        const useComponents = new ActionRowBuilder().addComponents(useMenu);
                        int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [useComponents, mainComponents],
                        });
                    }
                } catch (error) {
                    int.editReply({
                        content: '',
                        embeds: [premiumEmbed],
                        components: [mainComponents],
                    });
                }

            } else if (roles.includes("Premium")) {

                decayString = `\n └ Your role will decay on <t:${premiumData.date}:R>.`;

                premiumEmbed.setAuthor({ name: `💎 Welcome to your premium dashboard ${username}!`, iconURL: int.user.displayAvatarURL() })
                premiumEmbed.setDescription(`${tierString}\n\`\`\`⚠️ No perks available to claim!\`\`\``)
                premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew any of your perks.${decayString}` })
                mainComponents = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('premium-info')
                        .setLabel('✒️ Premium Info')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('renew-perks')
                        .setLabel('🔁 Renew Here')
                        .setStyle('Primary'),
                    new ButtonBuilder()
                        .setCustomId('upgrade-tier')
                        .setLabel('⏏️ Upgrade your Tier')
                        .setStyle('Primary'),
                )

                int.editReply({
                    content: '',
                    embeds: [premiumEmbed],
                    components: [mainComponents],
                });

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

                const defaultComponents = new ActionRowBuilder().addComponents(
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

                int.editReply({
                    content: '',
                    embeds: [premiumEmbed],
                    components: [defaultComponents],
                });
            }
        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}