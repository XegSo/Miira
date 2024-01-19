const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, Embed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Untimeout a user (Mod Only).')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to untimeout.')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason of untimeout.')
        ),
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const timeUser = int.options.getUser('user');
        const timeMember = await int.guild.members.fetch(timeUser.id);

        if (!int.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            int.editReply({ content: 'You don\'t have the permissions for this.', ephemeral: true });
            return;
        }
        if (!timeMember.kickable) {
            int.editReply({ content: 'I don\'t have the permissions to untimeout this user.', ephemeral: true });
            return;
        }
        if (int.member.id === timeMember.id || timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            int.editReply({ content: 'the fuck are you doing lol.', ephemeral: true });
            return;
        }
        if (!timeMember) {
            int.editReply({ content: 'Please provide valid fields.', ephemeral: true });
            return;
        }

        let reason = int.options.getString('reason') || 'No reason given.';

        await timeMember.timeout(null, reason);

        const embed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setDescription(`:white_check_mark: ${timeUser.tag}'s timeout has been removed. | Reason: ${reason}`)

        const dmEmbed = new EmbedBuilder()
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setColor('#f26e6a')
            .setDescription(`:white_check_mark: You have been untimed out in ${int.guild.name}. | Reason: ${reason}`)  
            
        await timeMember.send({ embeds: [dmEmbed] }).catch(err => {
            return;
        });
        
        int.editReply({ embeds: [embed] });
    }    
}