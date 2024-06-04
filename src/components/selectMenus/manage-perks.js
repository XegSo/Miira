const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const managePerkCache = new Map();

module.exports = {
    data: {
        name: 'manage-perks'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const [perkName, collabName] = int.values[0].split('-');
        try {
            const collab = await localFunctions.getCollab(collabName, collabCollection);
            const userPerks = collab.perks.users.filter(p => p.userId === int.user.id);
            const selectedPerk = userPerks.find(p => p.perk === perkName);
            delete selectedPerk.collabName;
            delete selectedPerk.status;
            delete selectedPerk.downloadURL;
            delete selectedPerk.perk;
            delete selectedPerk.userId;
            const perksEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Perks Dashboard\n', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setAuthor({ name: `Managing the ${perkName} for the ${collabName}!`, iconURL: 'https://puu.sh/JYyyk/5bad2f94ad.png' })
                .setDescription(`*Thank you for supporting the collabs!*\n                                                                                                        \n**\`\`\`ml\n✅ Current perk information\`\`\`**`);
            const propertiesNames = Object.keys(selectedPerk);
            const propertiesToDisplay = Object.keys(selectedPerk).map(localFunctions.transformPropertyName);
            for (let i = 0; i < propertiesToDisplay.length; i++) {
                perksEmbed.addFields(
                    {
                        name: "‎",
                        value: `\`\`💬 ${propertiesToDisplay[i]}\`\`\n **└** ${selectedPerk[propertiesNames[i]]}`,
                    }
                )
            }

            if (typeof collab.premium_designs[perkName] !== "undefined") {
                perksEmbed.addFields(
                    {
                        name: "‎",
                        value: `**\`\`\`ml\n📐 Current design\`\`\`**`
                    }
                )
                perksEmbed.setImage(collab.premium_designs[perkName]);
            } else {
                perksEmbed.addFields(
                    {
                        name: "‎",
                        value: `**\`\`\`ml\n📐 This perk hasn't been designed yet...\`\`\`**`
                    }
                )
            }
            let component;
            switch (collab.status) {
                case 'early access':
                case 'open':
                    component = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('perk-edit')
                            .setLabel('🔁 Edit')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('perk-prune')
                            .setLabel('⛔️ Prune')
                            .setStyle('Danger'),
                    )
                    await int.editReply({
                        content: '',
                        embeds: [perksEmbed],
                        components: [component],
                    });
                    break;
                case 'completed':
                case 'archived':
                    component = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('perk-download')
                            .setLabel('⬇️ Download')
                            .setStyle('Primary'),
                    )
                    await int.editReply({
                        content: '',
                        embeds: [perksEmbed],
                        components: [component],
                    });
                    break;
                default:
                    await int.editReply({
                        content: '',
                        embeds: [perksEmbed],
                    });
            }
        } catch (e) {
            console.log(e);
            await int.reply({ content: 'Try this interaction again... this took more than 3 seconds for some reason', ephemeral: true });
        } finally {
            mongoClientCollabs.close();
        }
    },
    managePerkCache: managePerkCache
}