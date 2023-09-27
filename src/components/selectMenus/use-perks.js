const { EmbedBuilder, TextInputStyle  } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const userCache = new Map();

module.exports = {
    data: {
        name: 'use-perks'
    },
    async execute(int, client) {
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const selectedPerk = int.values[0];
        console.log(selectedPerk);
        let fullPerk = [];
        for (const tier of localConstants.premiumTiers) {
            for (const perk of tier.perks) {
                if (perk.name === selectedPerk) {
                    fullPerk = perk;
                    break;
                }
            }
        }
        try {
            const usageStatus = await localFunctions.getPremiumData(collectionSpecial);
            if (!usageStatus.status && fullPerk.collabDependant) {
                int.editReply('You can\'t use this perk at the moment');
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId(`perk-modal`)
                .setTitle('Claim your perk!');

            const osuName = new TextInputBuilder()
                .setCustomId('osuName')
                .setLabel('Input your osu! username')
                .setPlaceholder('Don\'t make a typo!')
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const osuURL = new TextInputBuilder()
                .setCustomId('osuURL')
                .setLabel('Input your osu! profile link')
                .setPlaceholder('Ex: https://osu.ppy.sh/users/8143504')
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            if (selectedPerk === "Premium Avatar") {

                const avatarText = new TextInputBuilder()
                    .setCustomId('avText')
                    .setLabel('Input a display name for the avatar')
                    .setPlaceholder('This text will go in the name field (the shorter the better)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const avatarImageURL = new TextInputBuilder()
                    .setCustomId('avImageURL')
                    .setLabel('Insert the URL of the image you want')
                    .setPlaceholder('PNG FORMAT ONLY!!!!')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(new ActionRowBuilder().addComponents(osuName), new ActionRowBuilder().addComponents(osuURL), new ActionRowBuilder().addComponents(avatarText), new ActionRowBuilder().addComponents(avatarImageURL));

                await int.showModal(modal);

            } else if (selectedPerk === "Premium Cover") {

                const coverText = new TextInputBuilder()
                    .setCustomId('coverText')
                    .setLabel('Input a display name for the cover')
                    .setPlaceholder('This text will go in the name field (the shorter the better)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const coverImageURL = new TextInputBuilder()
                    .setCustomId('coverImageURL')
                    .setLabel('Insert the URL of the image you want')
                    .setPlaceholder('PNG FORMAT ONLY!!!!')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(new ActionRowBuilder().addComponents(osuName), new ActionRowBuilder().addComponents(osuURL), new ActionRowBuilder().addComponents(coverText), new ActionRowBuilder().addComponents(coverImageURL));

                await int.showModal(modal);

            } else if (selectedPerk === "Premium Animated Banner") {
                //TBD
            } else if (selectedPerk === "Premium Forum Signature") {
                //TBD
            } else if (selectedPerk === "Premium Animated Stream Overlay") {

                const overlayText = new TextInputBuilder()
                    .setCustomId('overlayText')
                    .setLabel('Input a display name for the overlay')
                    .setPlaceholder('This text will go in the name field (the shorter the better)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const overlayImageURL = new TextInputBuilder()
                    .setCustomId('overlayImageURL')
                    .setLabel('Insert the URL of the image you want')
                    .setPlaceholder('TRANSPARENT AND PNG FORMAT ONLY!!!!')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(new ActionRowBuilder().addComponents(osuName), new ActionRowBuilder().addComponents(osuURL), new ActionRowBuilder().addComponents(overlayText), new ActionRowBuilder().addComponents(overlayImageURL));
                
                await int.showModal(modal);
            
            } else if (selectedPerk === "Premium Desktop Wallpaper") {
                //TBD
            } else if (selectedPerk === "Premium Collab Poster") {
                //TBD
            } else if (selectedPerk === "Megacollab Themed osu! skin") {

                const skinNameText = new TextInputBuilder()
                    .setCustomId('skinText')
                    .setLabel('Input a display name for the skin')
                    .setPlaceholder('This text will go in the name field (the shorter the better)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const skinImageURL = new TextInputBuilder()
                    .setCustomId('skinImageURL')
                    .setLabel('Insert the URL of the image you want')
                    .setPlaceholder('TRANSPARENT AND PNG FORMAT ONLY!!!!')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(new ActionRowBuilder().addComponents(osuName), new ActionRowBuilder().addComponents(osuURL), new ActionRowBuilder().addComponents(skinNameText), new ActionRowBuilder().addComponents(skinImageURL));
                
                await int.showModal(modal);
            
            } else if (selectedPerk === "Extra Collab Materials") {
                //TBD
            } else if (selectedPerk === "Megacollab Early Access") {
                //Website Implementation
            } else if (selectedPerk === "Custom Endless Mirage Hoodie") {
                int.editReply('Please DM <@687004886922952755> to claim this perk!');
            } else if (selectedPerk === "Host your own Megacollab") {
                //TBD
            }

            userCache.set(int.user.id, {
                perk: selectedPerk,
            });

        } finally {
            mongoClientSpecial.close();
        }
    },
    userCache: userCache
}