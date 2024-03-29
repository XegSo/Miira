const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { SelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('premiumcheck')
        .setDescription('Check an user\'s premium status (Admin Only).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to assign the tier')
                .setRequired(true)
        ),
    async execute(int, client) {
        if (int.user.id !== '687004886922952755') return;
        await int.deferReply({ ephemeral: true });
        const userId = int.options.getUser('user').id;
        const guild = int.guild;
        let foundRole = null;
        let renewalPrice = '';
        let decayString = '';
        let tierString = "**No premium status found!**";
        let tierDetails = '';
        let newPerks = [];
        const username = int.options.getUser('user').tag;
        const member = await guild.members.fetch(userId);
        const tiers = localConstants.premiumTiers;

        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const premiumEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Premium Dashboard\n' , iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')

        if (!member.roles.cache.has('743505566617436301')) {
            try {
                let userPerks = await localFunctions.getPerks(userId, collection);
                if (userPerks.length !== 0) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')

                    premiumEmbed.setAuthor({ name: `Welcome to your perks dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                    premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`);
                    for (const perk of userPerks) {
                        premiumEmbed.addFields({
                            name: " ",
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
                    premiumEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                    await int.editReply({
                        content: '',
                        embeds: [premiumEmbed],
                        components: [useComponents, buyComponents],
                    });
                } else {
                    premiumEmbed.setDescription('**\`\`\`ml\n 🚀 Welcome to the premium section!\`\`\`**                                                                                                           **In this section, you can find information about the current premium tiers and their perks!**\n\n**• The perks are ACCUMULATIVE.** \n**• After one collab, most perks will need to be RENEWED.** \n**• If there is no renewal, there is a DECAY into former supporter.**\n**• You can also purchase SINGLE PERKS for single use in collabs.**\n**• Premium includes bump immunity.**')
                    premiumEmbed.addFields(
                        { name: " ", value: "**\`\`\`ml\n⚠️ Only the prominent perks are mentioned for each tier.\`\`\`**" }, 
                        { name: " ", value: "\`\`🎫 Mirage I Premium | Price: 5$\`\`\n └ Exclusive profile picture version." },
                        { name: " ", value: "\`\`🎫 Mirage II Premium | Price: 10$\`\`\n └ Animated Banner." },
                        { name: " ", value: "\`\`🎫 Mirage III Premium | Price: 15$\`\`\n └ Animated Stream Overlay." },
                        { name: " ", value: "\`\`🎫 Mirage IV Premium | Price: 20$\`\`\n └ Early collab delivery.\n" },
                        { name: " ", value: "\`\`🎫 Mirage V Premium | Price: 40$\`\`\n └ Customized collab themed osu! skin." },
                        { name: " ", value: "\`\`🎫 Mirage VI Premium | Price: 100$\`\`\n └ Collab early access." },
                        { name: " ", value: "\`\`🎫 Mirage VII Premium | Price: 250$\`\`\n └ Host your own megacollab." },
                        { name: " ", value: "**\`\`\`prolog\n💎 Find the full details about each tier in the list bellow.\`\`\`\n<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>**" },  
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
                    await int.editReply({
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
                if (!userTier && member.roles.cache.has('743505566617436301') && !member.roles.cache.has('1150484454071091280')) {
                    console.log('Executing insertion of perks'); //this needs to be moved into functions
                    for (const numeral of localConstants.romanNumerals) { //find the fucker and assign it to the database
                        const roleToFind = `Mirage ${numeral}`;
                        foundRole = member.roles.cache.find(role => role.name === roleToFind);

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
                                        console.log("Perks uploaded.")
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

                if (userPerks?.length) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')

                    premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });

                    if (userPerks.some(perk => perk.singleUse === false)) {
                        premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n🔮 Permanent perks\`\`\`**`)
                        tierString = ' '
                        for (const perk of userPerks) {
                            if ((!perk.singleUse || userTier.name === 'Mirage VII' || userTier.name === 'Mirage X') && perk.name !== 'Host your own Megacollab' && perk.name !== 'Custom Endless Mirage Hoodie') {
                                if (perk.singleUse) {
                                    useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                                }
                                premiumEmbed.addFields({
                                    name: " ",
                                    value: `\`\`✒️ ${perk.name}\`\`\n └ ${perk.description}`
                                });
                            }
                        }
                    }
                    if (userPerks.some(perk => perk.singleUse === true)) {
                        if (tierString !== ' ') {
                            premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n✅ Perks available to use!\`\`\`**`)
                        } else {
                            premiumEmbed.addFields(
                                {
                                    name: " ",
                                    value: "**\`\`\`ml\n✅ Perks available to use!\`\`\`**",
                                },
                            )
                        }
                        for (const perk of userPerks) {
                            if (perk.singleUse && userTier.name !== 'Mirage VII' && userTier.name !== 'Mirage X') {
                                if (perk.renewalPrice) {
                                    renewalPrice = `\n └ Your current renewal price is ${perk.renewalPrice}$.`;
                                } else {
                                    renewalPrice = '';
                                }
                                premiumEmbed.addFields({
                                    name: " ",
                                    value: `\`\`🎫 ${perk.name}\`\`\n ├ ${perk.description}${renewalPrice}`
                                });
                                useMenu.addOptions({ label: perk.name, value: perk.name, description: perk.description });
                            } else if (perk.name === 'Custom Endless Mirage Hoodie' || perk.name === 'Host your own Megacollab') {
                                premiumEmbed.addFields({
                                    name: " ",
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
                            premiumEmbed.addFields(
                                {
                                    name: "‎",
                                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                                }
                            )
                            await int.editReply({
                                content: '',
                                embeds: [premiumEmbed],
                                components: [useComponents, mainComponents],
                            });
                        }
                    } catch (error) {
                        premiumEmbed.addFields(
                            {
                                name: "‎",
                                value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                            }
                        )
                        await int.editReply({
                            content: '',
                            embeds: [premiumEmbed],
                            components: [mainComponents],
                        });
                    }

                } else {

                    decayString = `\n └ Your tier will decay <t:${premiumData.date}:R>.`;

                    premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
                    premiumEmbed.setDescription(`${tierString}\n                                                                                                        **\`\`\`ml\n⚠️ No perks available to claim!\`\`\`**`)
                    premiumEmbed.addFields({ name: " ", value: `\`\`🎫 Notice\`\`\n ├ It\'s recommended to renew any of your perks.${decayString}` })
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
                    premiumEmbed.addFields(
                        {
                            name: "‎",
                            value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                        }
                    )
                    await int.editReply({
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