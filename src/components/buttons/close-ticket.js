const { EmbedBuilder } = require('discord.js');
const { userTicketCache } = require('./create-ticket');

module.exports = {
    data: {
        name: 'close-ticket'
    },
    async execute(int) {
        const userTicket = userTicketCache.get(0);
        if (!userTicket) return;
        const timestamp = Math.floor(new Date(Date.now()) / 1000);
        const logChannel = int.guild.channels.cache.get('932911199773937674');
        const channel = int.channel;

        try {
            // Delete the channel
            await channel.delete();

            console.log(`Channel ${channel.name} deleted.`);
            const delEmbed = new EmbedBuilder()
                .setColor('#f26e6a')
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .setAuthor({ name: '❌ A ticket has been closed.', iconURL: userTicket.avatar })
                .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
                .setDescription(`Opened by <@${userTicket.user.id}>\nClosed by <@${int.user.id}>\nDate: <t:${timestamp}:F>.`)
                .setTimestamp();

            await logChannel.send({ embeds: [delEmbed] });
            userTicketCache.delete(int.user.id);
        } catch (err) {
            console.error('Error deleting channel:', err);
        }
    }
};
