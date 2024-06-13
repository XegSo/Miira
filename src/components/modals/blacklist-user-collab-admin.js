const { EmbedBuilder } = require('discord.js');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { collabCache } = require('./manage-pick-collab');
const { userCheckCache } = require('../../commands/collabs/collabs');

module.exports = {
    data: {
        name: 'blacklist-user-collab-admin'
    },
    async execute(int, client) {
        let initializedMap;
        if (collabCache.size > 0) {
            if (typeof collabCache.get(int.user.id) !== 'undefined') {
                initializedMap = collabCache;
            }
        }
        if (userCheckCache.size > 0) {
            if (typeof userCheckCache.get(int.user.id) !== 'undefined') {
                initializedMap = userCheckCache;
            }
        }
        await int.deferReply({ ephemeral: true });

        // MongoDB collections.
        const collection = client.db.collection('Collabs');
        const userCollection = client.db.collection('OzenCollection');
        const blacklistCollection = client.db.collection('Blacklist');

        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);

        const collab = initializedMap.get(int.user.id).collab;
        const pickFull = initializedMap.get(int.user.id).pick;
        let participants = collab.participants;
        const id = pickFull.id;
        const fullParticipation = participants.find((e) => e.id === id);

        await localFunctions.setBlacklist(fullParticipation.discordId, int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : 'None', fullParticipation.osu_id, blacklistCollection);
        let userCollabs = await localFunctions.getUserCollabs(fullParticipation.discordId, userCollection);
        await localFunctions.unsetCollabParticipation(collab.name, collection, id);
        userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
        await localFunctions.setUserCollabs(fullParticipation.discordId, userCollabs, userCollection);
        await localFunctions.removeCollabParticipant(collab.name, collection, fullParticipation.discordId);
        await localFunctions.unsetParticipationOnSheet(collab, pickFull);
        await localFunctions.liquidateUserOsuData(fullParticipation.discordId, userCollection);

        const pendingMember = await guild.members.fetch(fullParticipation.discordId);
        await pendingMember.roles.remove(collab.roleId);

        let contentString = '';
        const snipes = collab.snipes;
        if (typeof snipes !== 'undefined') {
            if (typeof snipes.find(p => p.pick === id) !== 'undefined') {
                contentString = 'Snipers! ';
            }
            for (const snipe of snipes) {
                contentString = contentString.concat('', `<@${snipe.userId}>`);
                await localFunctions.removeCollabSnipe(collab.name, collection, snipe.userId);
            }
        }

        const leaveEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | New Character Available', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setDescription(`**\`\`\`ml\n📣 New Character Available!\`\`\`**                                                                                                        **${collab.name}**\nName:${pickFull.name}\nID: ${pickFull.id}`)
            .setImage(pickFull.imgURL);
        logChannel.send({ content: `${contentString}\nUser <@${fullParticipation.discordId}> has been blacklisted from the collabs.\n**Reason:** ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : 'None'}\n**Removed by:** <@${int.user.id}>`, embeds: [leaveEmbed] });

        const auditEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **An user has been blacklisted!**\n\n**Pick Name**: ${pickFull.name}\n**Pick ID**: ${pickFull.id}\n**Ex-Owner**: <@${fullParticipation.discordId}>\n**Removed by**: <@${int.user.id}>\n**Reason**: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : 'None'}`);
        auditChannel.send({ content: '', embeds: [auditEmbed] });
        await int.editReply('The user has been blacklisted.');
    }
};
