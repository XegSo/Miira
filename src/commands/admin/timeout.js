const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user (Mod Only).')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to timeout.')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option
                .setName('minutes')
                .setDescription('Amount of minutes to timeout.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason of timeout.')
        ),
    async execute(int, client) {
        await int.deferReply();
        const timeUser = int.options.getUser('user');
        const timeMember = await int.guild.members.fetch(timeUser.id);
        const duration = int.options.getInteger('minutes')*60;

        if (!int.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            await int.editReply({ content: 'You don\'t have the permissions for this.', ephemeral: true });
            return;
        }
        if (!timeMember.kickable) {
            await int.editReply({ content: 'I don\'t have the permissions to timeout this user.', ephemeral: true });
            return;
        }
        if (int.member.id === timeMember.id || timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await int.editReply({ content: 'the fuck are you doing lol.', ephemeral: true });
            return;
        }
        if (!duration || !timeMember) {
            await int.editReply({ content: 'Please provide valid fields.', ephemeral: true });
            return;
        }

        let reason = int.options.getString('reason') || 'No reason given.';

        await timeMember.timeout(duration * 1000, reason);

        const embed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setDescription(`:white_check_mark: ${timeUser.tag} has been timed out for ${duration / 60 } minute(s) | Reason: ${reason}`)

        const dmEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setDescription(`:white_check_mark: You have been timed out in ${int.guild.name}. You can check the status in the server. | Reason: ${reason}`)  
            
        await timeMember.send({ embeds: [dmEmbed] }).catch(err => {
            return;
        });
        
        await int.editReply({ embeds: [embed] });
    }    
}