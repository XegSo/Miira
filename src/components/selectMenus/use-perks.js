const { TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const perkCache = new Map();

module.exports = {
    data: {
        name: 'use-perks'
    },
    async execute(int, client) {
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const selectedPerk = int.values[0];
        console.log(selectedPerk);
        let fullPerk = [];
        for (const perk of localConstants.premiumPerks) {
            if (perk.name === selectedPerk) {
                fullPerk = perk;
                break;
            }
        }
        try {
            if (selectedPerk === "Custom Endless Mirage Hoodie" || selectedPerk === "Host your own Megacollab") return await int.reply({ content: 'To claim this perk, please DM the host!', ephemeral: true });
            const allCollabs = await localFunctions.getCollabs(collabCollection);
            let openMegacollab = allCollabs.find(c => c.restriction === "megacollab" /*&& c.status === "open"*/);
            if (typeof openMegacollab === "undefined") return await int.reply({ content: 'There is no open megacollabs at the moment...', ephemeral: true })
            if (selectedPerk === "Collab Early Access") {
                if (openMegacollab.status === "early access") {
                    await int.reply({ content: 'You can claim this perk now! Join the collab using ``/collabs join``', ephemeral: true });
                } else if (openMegacollab.status === "open") {
                    await int.reply({ content: 'The early access for the current megacollab already has passed! You will be able to claim this perk in the next megacollab.', ephemeral: true });
                }
                return;
            }
            const fieldRestrictions = openMegacollab.fieldRestrictions.premium_perks;
            const currentRestrictions = fieldRestrictions[selectedPerk];
            const modal = new ModalBuilder()
                .setCustomId("perk-modal")
                .setTitle('Claim your perk!');

            let modalField;
            for (const requiredField of fullPerk.fields) {
                if (requiredField.type === "text") {
                    let res = currentRestrictions[requiredField.name];
                    modalField = new TextInputBuilder()
                        .setCustomId(requiredField.name)
                        .setLabel(requiredField.title)
                        .setPlaceholder(requiredField.placeholder)
                        .setMinLength(2)
                        .setMaxLength(res)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);
                } else if (requiredField.type === "url") {
                    modalField = new TextInputBuilder()
                        .setCustomId(requiredField.name)
                        .setLabel(requiredField.title)
                        .setPlaceholder(requiredField.placeholder)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);
                }
                modal.addComponents(new ActionRowBuilder().addComponents(modalField));
                modalField = "";
            }

            await int.showModal(modal);

            perkCache.set(int.user.id, {
                perk: fullPerk,
                collab: openMegacollab
            });

        } catch {
            await int.reply({ content: 'Try this interaction again... this took more than 3 seconds for some reason', ephemeral: true });
        } finally {
            mongoClientCollabs.close();
        }
    },
    perkCache: perkCache
}