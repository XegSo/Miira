const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { buttonCache } = require('../selectMenus/select-collab');

module.exports = {
    data: {
        name: 'join-collab'
    },
    async execute(int, client) {
        const { collection: collabsCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        try {
            let userOsuData = buttonCache.get(int.user.id).osuData
            let userCollabData = buttonCache.get(int.user.id).userCollabData
            const collabName = buttonCache.get(int.user.id).collab;
            if (!userOsuData) {
                await int.deferReply({ ephemeral: true });
                const components = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('link-osu')
                        .setLabel('🔗 Link your osu! Account')
                        .setStyle('Success'),
                )
                await int.editReply({
                    content: 'It seems like you haven\'t linked your osu! account with Miira. To proceed please link it using the button bellow.',
                    components: [components]
                });
                return;
            } else {
                let allCollabs = await localFunctions.getCollabs(collabsCollection);
                let verificationCollabs = allCollabs.find(e => e.status === "open" || e.status === "full" || e.status === "delivered" || e.status === "early access" || e.status === "closed");
                verificationCollabs = verificationCollabs || [];
                if (typeof userCollabData.find(e => verificationCollabs.find(c => c.name === e.name)) !== "undefined") {
                    return await int.editReply('You are already participating in an active collab!');
                }
                if (typeof userCollabData.find(e => e.collabName === collabName) !== "undefined") {
                    await int.deferReply({ ephemeral: true });
                    await int.editReply({
                        content: 'You are already participating in this collab. To edit your data, manage your participation in your collabs profile.',
                    });
                }
                const collabData = await localFunctions.getCollab(collabName, collabsCollection);
                const modal = new ModalBuilder()
                    .setCustomId("join-collab")
                    .setTitle(`${collabName}`);

                const pick = new TextInputBuilder()
                    .setCustomId('pick')
                    .setLabel('Type the ID of your pick.')
                    .setPlaceholder('Only the number of the character you want to pick. Example: 1387')
                    .setMaxLength(collabData.fieldRestrictions.av)
                    .setStyle(TextInputStyle.Short)    

                const av_text = new TextInputBuilder()
                    .setCustomId('av_text')
                    .setLabel('Type the text for the avatar.')
                    .setPlaceholder('Tipically your username.')
                    .setMinLength(2)
                    .setMaxLength(collabData.fieldRestrictions.av)
                    .setStyle(TextInputStyle.Short)

                const ca_text = new TextInputBuilder()
                    .setCustomId('ca_text')
                    .setLabel('Type the text for the card.')
                    .setPlaceholder('Tipically your username.')
                    .setMinLength(2)
                    .setMaxLength(collabData.fieldRestrictions.ca)
                    .setStyle(TextInputStyle.Short)

                const ca_quote = new TextInputBuilder()
                    .setCustomId('ca_quote')
                    .setLabel('Type a quote for the card.')
                    .setPlaceholder('Optional.')
                    .setMinLength(2)
                    .setMaxLength(collabData.fieldRestrictions.ca_quote)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                modal.addComponents(new ActionRowBuilder().addComponents(pick), new ActionRowBuilder().addComponents(av_text), new ActionRowBuilder().addComponents(ca_text), new ActionRowBuilder().addComponents(ca_quote));

                await int.showModal(modal);
            }
        } finally {
            mongoClientCollabs.close();
        }
    },
    buttonCache: buttonCache
}