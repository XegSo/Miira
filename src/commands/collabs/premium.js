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
        let renewalPrice = '';
        let decayString = '';
        let tierString = "**No premium status found!**";
        let tierDetails = '';
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(userId);
        const username = int.user.tag;

        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const premiumEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Premium Dashboard\n', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')

        if (!guildMember.roles.cache.has('743505566617436301')) {
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
                let monthlySupportData = await localFunctions.getUserMontlyPremium(userId, collection);

                if (!userTier && guildMember.roles.cache.has('743505566617436301') && !guildMember.roles.cache.has('1150484454071091280')) {
                    let premiumDetails = await localFunctions.assignPremium(userId, collection, guildMember);
                    userTier = premiumDetails[0];
                    userPerks = premiumDetails[1];
                    tierDetails = premiumDetails[2];
                    tierString = `**Current Tier: ${userTier.name}**`;
                } else if (userTier) {
                    tierString = `**Current Tier: ${userTier.name}**`;
                    tierDetails = localConstants.premiumTiers.find(tier => tier.name === userTier.name);
                }

                if (tierDetails.generalRenewalPrice) {
                    tierString = `${tierString}\n*Renewal price for all perks: ${tierDetails.generalRenewalPrice}$*`;
                }

                let activeMonthlySupport = false;
                if (monthlySupportData) {
                    if (monthlySupportData.status !== "innactive") {
                        activeMonthlySupport = true;
                    }
                }

                let subComponent;
                if (activeMonthlySupport) {
                    subComponent = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('sub-manage')
                            .setLabel('💵 Manage Monthly Subscription')
                            .setStyle('Primary'),
                    )
                } else {
                    subComponent = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('subscribe')
                            .setLabel('💵 Subscribe')
                            .setStyle('Primary'),
                    )
                }

                if (userPerks?.length || activeMonthlySupport) {
                    let useMenu = new SelectMenuBuilder()
                        .setCustomId('use-perks')
                        .setPlaceholder('Use your perks.')

                    premiumEmbed.setAuthor({ name: `Welcome to your premium dashboard ${username}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' });
                    // to rewrite into a single for loop with switch case
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

                    if (activeMonthlySupport) {
                        const currentTier = localFunctions.premiumToInteger(userTier.name);
                        let nextTier = 0;
                        let fullNextTier;
                        if (currentTier !== 7 && currentTier !== 10) {
                            nextTier = currentTier + 1;
                            fullNextTier = localConstants.premiumTiers[nextTier - 1];
                            const totalSubAmount = parseInt(monthlySupportData.total);
                            const monthlySubAmount = parseInt(monthlySupportData.currentAmount);
                            const nextTierAmount = fullNextTier.cost;
                            const pendingAmount = nextTierAmount - totalSubAmount;
                            const monthsPending = Math.ceil(pendingAmount/monthlySubAmount);
                            premiumEmbed.addFields(
                                {
                                    name: " ",
                                    value: `**\`\`\`ml\n✅ Active subscription status!\`\`\`**\n\`\`❤️ Current Monthly Amount\`\`\n └ ${monthlySubAmount}$\n\n\`\`❤️ Time Pending for the Next Tier\`\`\n └ ${monthsPending} Month(s)!\n\n\`\`❤️ Amount Pending for the Next Tier\`\`\n └ ${pendingAmount}$\n\n*Your current subscription includes automatic renewal for all perks and free access to deluxe collabs.*\n*For more info about your subscription, use the manage button bellow!*`,
                                },
                            )
                        } else {
                            premiumEmbed.addFields(
                                {
                                    name: " ",
                                    value: "**\`\`\`ml\n✅ Active subscription status!\`\`\`**\n**You're currently at the peak tier! Thank you for your incredible support!**\n\n*Your current subscription includes automatic renewal for all perks and free access to deluxe collabs.*\n*For more info about your subscription, use the manage button bellow!*",
                                }
                            )
                        }

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
                                components: [useComponents, mainComponents, subComponent],
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
                            components: [mainComponents, subComponent],
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
                        components: [mainComponents, subComponent],
                    });
                }
            } finally {
                mongoClient.close();
                mongoClientSpecial.close();
            }
        }
    }
}