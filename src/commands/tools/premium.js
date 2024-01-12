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
        let tierString = `**No premium status found!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼**`;
        let tierDetails = '';
        let newPerks = [];
        const username = int.user.tag;
        const tiers = localConstants.premiumTiers;

        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const premiumEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setTimestamp();

        if (!int.member.roles.cache.has('743505566617436301')) {
            try {
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (userPerks.length !== 0) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')

                    premiumEmbed.setAuthor({ name: `Welcome to your perks dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                    premiumEmbed.setThumbnail(int.user.displayAvatarURL());
                    premiumEmbed.addFields(
                        {
                            name: `${tierString}`,
                            value: `**\`\`\`ml\n✅ Perks available to use!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`,
                        },
                        )
                    for (const perk of userPerks) {
                        premiumEmbed.addFields({
                            name: ` `,
                            value: `\`\`🎫 ${perk.name}\`\`
                                 [├](https://discord.com/channels/630281137998004224/767374005782052864) ${perk.description}\n └ Your current renewal price is ${perk.individualPrice}$.`
                        });
                        useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                    }
                    const useComponents = new ActionRowBuilder().addComponents(useMenu);
                    let buyComponents = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('premium-info')
                            .setLabel('✒️ About')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('shopping-cart')
                            .setLabel('🛒 Cart')
                            .setStyle('Primary'),     
                        new ButtonBuilder()
                            .setCustomId('perks-buy')
                            .setLabel('🔀 Perk Shop')
                            .setStyle('Primary'),
                    )

                    int.editReply({
                        content: '',
                        embeds: [premiumEmbed],
                        components: [useComponents, buyComponents],
                    });
                } else {
                    premiumEmbed.setDescription('**\`\`\`ml\n 🚀 Welcome to the premium section!\`\`\`**\n**In this section, you can find information about the current premium tiers and their perks!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼**\n\n**\`\`• The perks are ACCUMULATIVE.᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`** \n**\`\`• After one collab, most perks will need to be RENEWED.᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`** \n**\`\`• If there is no renewal, there is a DECAY into former supporter.᲼᲼᲼\`\`**\n**\`\`• You can also purchase SINGLE PERKS for single use in collabs.᲼᲼᲼᲼᲼\`\`**\n**\`\`• Premium includes bump immunity.᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`**');
                    premiumEmbed.addFields(
                        { name: ` `, value: `**\`\`\`ml\n⚠️ Only the prominent perks are mentioned for each tier.\`\`\`**` }, 
                        { name: ` `, value: `\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version.` },
                        { name: ` `, value: `\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner.` },
                        { name: ` `, value: `\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay.` },
                        { name: ` `, value: `\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n` },
                        { name: ` `, value: `\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin.` },
                        { name: ` `, value: `\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access.` },
                        { name: ` `, value: `\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab.` },
                        { name: ` `, value: `**\`\`\`prolog\n💎 Find the full details about each tier in the list bellow.\`\`\`**` },  
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
        } else {
            try {
                let userPerks = await localFunctions.getPerks(userId, collection);
                let premiumData = await localFunctions.getPremiumData(collectionSpecial);
                let mainComponents = [];
                let userTier = await localFunctions.getUserTier(userId, collection);

                if (!userTier && int.member.roles.cache.has('743505566617436301') && !int.member.roles.cache.has('1150484454071091280')) {
                    console.log('Executing insertion of perks'); //this needs to be moved into functions
                    for (const numeral of localConstants.romanNumerals) { //find the fucker and assign it to the database
                        const roleToFind = `Mirage ${numeral}`;
                        foundRole = int.member.roles.cache.find(role => role.name === roleToFind);

                        if (foundRole) {
                            let tierNumber = localFunctions.romanToInteger(numeral);
                            const foundTier = {
                                name: foundRole.name,
                                id: foundRole.id
                            };
                            await localFunctions.setUserTier(userId, foundTier, collection);
                            userTier = foundTier;
                            tierString = `**Current Tier: ${foundTier.name}**`;
                            tierDetails = localConstants.premiumTiers.find(tier => tier.name === foundRole.name);
                            if (tierNumber > 3) { //for non renewable fuck, assign the non renewable fuckers
                                for (const tier of tiers) {
                                    for (const perk of tier.perks) {
                                        if ((tierNumber === 7 || tierNumber === 10) && (perk.name !== 'Host your own Megacollab' || perk.name !== 'Custom Endless Mirage Hoodie')) { //Peak tiers have all the perks permanent to them
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
                } else if (userTier) {
                    tierString = `**Current Tier: ${userTier.name}**`;
                    tierDetails = localConstants.premiumTiers.find(tier => tier.name === userTier.name);
                } 

                if (tierDetails.generalRenewalPrice) {
                    tierString = `${tierString}\n*Renewal price for all perks: ${tierDetails.generalRenewalPrice}$*`;
                }

                console.log(userTier.name);

                if (userPerks && userPerks.length) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')

                    premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                    premiumEmbed.setThumbnail(int.user.displayAvatarURL());

                    if (userPerks.some(perk => perk.singleUse === false)) {
                        premiumEmbed.addFields(
                            {
                                name: `${tierString}`,
                                value: `**\`\`\`ml\n🔮 Permanent perks\`\`\`**`,
                            },
                        )
                        tierString = '‎'
                        for (const perk of userPerks) {
                            if ((!perk.singleUse || userTier.name === 'Mirage VII' || userTier.name === 'Mirage X') && perk.name !== 'Host your own Megacollab' && perk.name !== 'Custom Endless Mirage Hoodie') {
                                if (perk.singleUse) {
                                    useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                }
                                premiumEmbed.addFields({
                                    name: ` `,
                                    value: `\`\`✒️ ${perk.name}\`\`
                                         ├ ${perk.description}`
                                });
                            }
                        }
                    }
                    if (userPerks.some(perk => perk.singleUse === true)) {
                        premiumEmbed.addFields(
                            {
                                name: `${tierString}`,
                                value: `**\`\`\`ml\n✅ Perks available to use!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`,
                            },
                        )
                        for (const perk of userPerks) {
                            if (perk.singleUse && userTier.name !== 'Mirage VII' && userTier.name !== 'Mirage X') {
                                if (perk.renewalPrice) {
                                    renewalPrice = `\n └ Your current renewal price is ${perk.renewalPrice}$.`;
                                } else {
                                    renewalPrice = '';
                                }
                                premiumEmbed.addFields({
                                    name: ` `,
                                    value: `\`\`🎫 ${perk.name}\`\`
                                     └ ${perk.description}${renewalPrice}`
                                });
                                useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                            } else if (perk.name === 'Custom Endless Mirage Hoodie' || perk.name === 'Host your own Megacollab') {
                                premiumEmbed.addFields({
                                    name: ` `,
                                    value: `\`\`🎫 ${perk.name}\`\`
                                     └ ${perk.description}`
                                });
                                useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                            }
                        }
                    }

                    mainComponents = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('premium-info')
                            .setLabel('✒️ About')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('shopping-cart')
                            .setLabel('🛒 Cart')
                            .setStyle('Primary'),    
                        new ButtonBuilder()
                            .setCustomId('perks-buy')
                            .setLabel('🔀 Shop')
                            .setStyle('Primary'),    
                    )

                    if (userTier.name !== "Mirage VII" || userTier.name !== "Mirage X") {
                        mainComponents.addComponents(
                        new ButtonBuilder()
                            .setCustomId('upgrade-tier')
                            .setLabel('⏏️ Upgrade')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('premium-renew')
                            .setLabel('🔁 Renew')
                            .setStyle('Primary'),
                        );
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

                } else {

                    decayString = `\n └ Your tier will decay <t:${premiumData.date}:R>.`;

                    premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
                    premiumEmbed.setDescription(`${tierString}\n**\`\`\`ml\n⚠️ No perks available to claim!᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼\`\`\`**`)
                    premiumEmbed.addFields({ name: ` `, value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew any of your perks.${decayString}` })
                    premiumEmbed.setThumbnail(int.user.displayAvatarURL());
                    mainComponents = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('premium-info')
                            .setLabel('✒️ About')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('shopping-cart')
                            .setLabel('🛒 Cart')
                            .setStyle('Primary'),   
                        new ButtonBuilder()
                            .setCustomId('perks-buy')
                            .setLabel('🔀 Shop')
                            .setStyle('Primary'),      
                        new ButtonBuilder()
                            .setCustomId('premium-renew')
                            .setLabel('🔁 Renew')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('upgrade-tier')
                            .setLabel('⏏️ Upgrade')
                            .setStyle('Primary'),    
                    )

                    int.editReply({
                        content: '',
                        embeds: [premiumEmbed],
                        components: [mainComponents],
                    });
                } 
            } finally {
                mongoClient.close();
                mongoClientSpecial.close();
            }
        }    
    }
}