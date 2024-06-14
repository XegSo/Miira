const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const { collabCache } = require('../buttons/admin-collab');
const { adminCache } = require('../../commands/admin/admin');

module.exports = {
    data: {
        name: 'deliver-collab'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('Collabs');
        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== 'undefined') {
                initializedMap = collabCache;
            }
        }
        if (adminCache.size > 0) {
            if (typeof adminCache.get(int.user.id) !== 'undefined') {
                initializedMap = adminCache;
            }
        }

        const collab = initializedMap.get(int.user.id).collab;
        const fullCollab = await localFunctions.getCollab(collab, collection);
        const logChannel = fullCollab.logChannel;
        let ping = '';
        switch (fullCollab.restriction) {
        case 'none':
            break;
        case 'megacollab':
            ping = '<@&854444817316577340>';
            break;
        default:
            if (typeof fullCollab.role !== 'undefined') {
                ping = `<@&${fullCollab.role}>`;
            }
        }
        const bucketURL = `https://storage.googleapis.com/${int.fields.getTextInputValue('bucket')}/`;
        await localFunctions.setCollabBucket(collab, bucketURL, collection);
        await localFunctions.setCollabStatus(collab, 'delivered', collection);
        let embeds = [];
        const dashboardEmbed = new EmbedBuilder()
            .setColor(fullCollab.color)
            .setURL('https://endlessmirage.net/');

        dashboardEmbed.setDescription(`**\`\`\`\n🏐 ${fullCollab.name} has been delivered open!\`\`\`**`);
        dashboardEmbed.setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'attachment://footer.png' });
        embeds.push(dashboardEmbed);

        for (const design in fullCollab.designs) {
            let embed = new EmbedBuilder()
                .setURL('https://endlessmirage.net/')
                .setImage(fullCollab.designs[design]);

            embeds.push(embed);
        }

        const attachment = new AttachmentBuilder(fullCollab.thumbnail, {
            name: 'thumbnail.png'
        });

        await logChannel.send({
            content: ping,
            files: [attachment,
                {
                    attachment: `./assets/coloredLogos/logo-${fullCollab.color}.png`,
                    name: 'footer.png'
                }
            ],
            embeds: embeds
        });

        await int.editReply('The collab has been delivered!');
    }
};
