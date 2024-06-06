const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { reportCache } = require('../buttons/report-accept');

module.exports = {
    data: {
        name: "blacklist-user-report"
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection: blacklistCollection, client: mongoClientBlacklist } = await connectToMongoDB("Blacklist");
        const guild = client.guilds.cache.get(localConstants.guildId);
        const logChannel = guild.channels.cache.get(localConstants.logChannelID);
        const auditChannel = guild.channels.cache.get(localConstants.auditLogChannelID);

        try {
            const report = reportCache.get(int.user.id).report;
            const collab = await localFunctions.getCollab(report.collab, collection);
            const pickFull = collab.pool.items.find(e => e.id === report.pickId);
            const message = reportCache.get(int.user.id).message;
            const id = pickFull.id;
            const fullParticipation = collab.participants.find((e) => e.id === id);

            await localFunctions.setBlacklist(fullParticipation.discordId, int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None", fullParticipation.osu_id, blacklistCollection);
            let userCollabs = await localFunctions.getUserCollabs(fullParticipation.discordId, userCollection);
            await localFunctions.unsetCollabParticipation(collab.name, collection, id);
            userCollabs = userCollabs.filter(e => e.collabName !== collab.name);
            await localFunctions.setUserCollabs(fullParticipation.discordId, userCollabs, userCollection);
            await localFunctions.removeCollabParticipant(collab.name, collection, fullParticipation.discordId);
            await localFunctions.unsetParticipationOnSheet(collab, pickFull);

            let contentString = "";
            const snipes = collab.snipes;
            if (typeof snipes !== "undefined") {
                if (typeof snipes.find(p => p.pick === id) !== "undefined") {
                    contentString = "Snipers! ";
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
                .setImage(pickFull.imgURL)
            logChannel.send({ content: `${contentString}\nUser <@${fullParticipation.discordId}> has been blacklisted from the collabs.\n**Reason:** ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}\n**Removed by:** <@${int.user.id}>`, embeds: [leaveEmbed] });

            const auditEmbed = new EmbedBuilder()
                .setFooter({ text: 'Endless Mirage | Audit Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setDescription(`**\`\`\`ml\n📣 New Action Taken\`\`\`**                                                                                                        **An user has been blacklisted!**\n\n**Pick Name**: ${pickFull.name}\n**Pick ID**: ${pickFull.id}\n**Ex-Owner**: <@${fullParticipation.discordId}>\n**Removed by**: <@${int.user.id}>\n**Reason**: ${int.fields.getTextInputValue('reason') ? int.fields.getTextInputValue('reason') : "None"}`);
            auditChannel.send({ content: '', embeds: [auditEmbed] });

            let reportEmbed = new EmbedBuilder()
                .setFooter({ text: "Endless Mirage | Report Accepted", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setTimestamp()
                .setURL('https://endlessmirage.net/')
                .setDescription(`**\`\`\`📣 Report Accepted\`\`\`**\n**Action taken:** Blacklist\n**Admin:** <@${int.user.id}>`)
                .addFields(
                    {
                        name: report.embed.data.fields[0].name,
                        value: report.embed.data.fields[0].value
                    },
                    {
                        name: report.embed.data.fields[1].name,
                        value: report.embed.data.fields[1].value
                    }
                )

            const reporterMember = await guild.members.cache.find(member => member.id === report.reporterUser);
            try {
                reporterMember.send({
                    content: `Your report for the user <@${report.reportedUser}> has been accepted and the user has been blacklisted from future collabs.`,
                });
            } catch (e) {
                console.log(e);
                const logChannel = guild.channels.cache.get(localConstants.logChannelID);
                logChannel.send({
                    content: `<@${report.reporterUser}> Your report for the user <@${report.reportedUser}> has been accepted and the user has been blacklisted from future collabs.`,
                });
            }

            await message.edit({ embeds: [reportEmbed], components: [] });
            await localFunctions.liquidateReport(report._id);
            await int.editReply('The user has been blacklisted.');
        } finally {
            mongoClient.close();
            mongoClientUsers.close();
            mongoClientBlacklist.close();
        }
    },
};