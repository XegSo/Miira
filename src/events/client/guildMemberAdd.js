const localConstants = require('../../constants');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.get(localConstants.welcomeChannelID);

        if (welcomeChannel) {
            welcomeChannel.send(`Welcome to the server <@${member.user.id}>! Make sure to read the <#991755017851781262> and check all the channels on the Endless Mirage server section!`);
        }
    }
}