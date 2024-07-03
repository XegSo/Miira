const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { managePerkCache } = require('../selectMenus/manage-perks');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const perkCache = new Map();

module.exports = {
    data: {
        name: 'perk-edit'
    },
    async execute(int, client) {
        const collabName = managePerkCache.get(int.user.id).collabName;
        const collabCollection = client.db.collection('Collabs');
        const perkName = managePerkCache.get(int.user.id).perkName;
        const fullPerk = localConstants.premiumPerks.find(p => p.name === perkName);

        try {
            const fullCollab = await localFunctions.getCollab(collabName, collabCollection);
            const fieldRestrictions = fullCollab.fieldRestrictions.premium_perks;
            const currentRestrictions = fieldRestrictions[perkName];
            const modal = new ModalBuilder()
                .setCustomId('perk-edit')
                .setTitle('Edit your perk!');
            let modalField;
            for (const requiredField of fullPerk.fields) {
                if (requiredField.type === 'text') {
                    let res = currentRestrictions[requiredField.name];
                    modalField = new TextInputBuilder()
                        .setCustomId(requiredField.name)
                        .setLabel(requiredField.title)
                        .setPlaceholder(requiredField.placeholder)
                        .setMinLength(2)
                        .setMaxLength(res)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);
                } else if (requiredField.type === 'url') {
                    modalField = new TextInputBuilder()
                        .setCustomId(requiredField.name)
                        .setLabel(requiredField.title)
                        .setPlaceholder(requiredField.placeholder)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);
                }
                modal.addComponents(new ActionRowBuilder().addComponents(modalField));
                modalField = '';
            }
            await int.showModal(modal);
            perkCache.set(int.user.id, {
                perk: fullPerk,
                collab: fullCollab
            });
        } catch (e) {
            console.log(e);
            await int.reply({ content: 'Try this interaction again... this took more than 3 seconds for some reason', ephemeral: true });
        }
    },
    perkCache: perkCache
};
