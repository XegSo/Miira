const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'report-deny'
    },
    async execute (int, client) {
        await int.deferReply({ ephemeral: true })
        const report = await localFunctions.getReportByMessage(client, int.message.id);

        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(int.user.id);
        if (!guildMember.roles.cache.has('630636502187114496')) return int.editReply('You have no permission to do this!');
        if (typeof report === "undefined") return int.editReply('Something went wrong...');
        
        let reportEmbed = new EmbedBuilder()
            .setFooter({ text: "Endless Mirage | Report Denied", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setTimestamp()
            .setURL('https://endlessmirage.net/')
            .setDescription(`**\`\`\`📣 Report Denied\`\`\`**`)
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
        await int.message.edit({ embeds: [reportEmbed], components: [] });
        await localFunctions.liquidateReport(client, report._id);
        await int.editReply({ content: 'Request successfully denied.', ephemeral: true });
        const reporterMember = await guild.members.cache.find(member => member.id === report.reporterUser);
        try {
            reporterMember.send({
                content: `Your report for the user <@${report.reportedUser}> has been declined.`,
            });
        } catch (e) {
            console.log(e);
            const logChannel = guild.channels.cache.get(localConstants.logChannelID);
            logChannel.send({
                content: `<@${report.reporterUser}> Your report for the user <@${report.reportedUser}> has been declined.`,
            });
        }
    }
};