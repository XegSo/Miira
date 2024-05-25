const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { buttonCache } = require('../selectMenus/select-collab');
const joinCache = new Map();

module.exports = {
    data: {
        name: 'join-collab-random'
    },
    async execute(int, client) {
        try {
            const collabName = buttonCache.get(int.user.id).collab;
            const collabData = buttonCache.get(int.user.id).fullCollabData;
            const modal = new ModalBuilder()
                .setCustomId("join-collab-random")
                .setTitle(`${collabName}`);

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

            modal.addComponents(new ActionRowBuilder().addComponents(av_text), new ActionRowBuilder().addComponents(ca_text), new ActionRowBuilder().addComponents(ca_quote));

            await int.showModal(modal);

            joinCache.set(int.user.id, {
                collab: buttonCache.get(int.user.id).collab,
                osuData: buttonCache.get(int.user.id).osuData,
                userCollabData: buttonCache.get(int.user.id).userCollabData
            })
            buttonCache.delete(int.user.id);

        } catch {
            int.reply({
                content: 'Collab is not cached, try to run the command to show it again.',
                ephemeral: true
            })
        } 
    },
    joinCache: joinCache
}