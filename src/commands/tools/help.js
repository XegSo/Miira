const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display info for all the commands.'),
    async execute(int, client) {
        const helpEmbedTop = new EmbedBuilder()
            .setImage('https://puu.sh/JPjqk/bce4cc9fa1.png')
            .setColor('#f26e6a');
        const helpEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
            .setTitle('**Bot Commands:**')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setDescription('• \`\`/help\`\` Displays this message.\n\n• \`\`/profile\`\` Displays your profile with your Balance, Top message Combo and Current token Booster.\n\n• \`\`/shop\`\` Use this command to view the shop and make a purchase of an item. Once you purchase an item it will go into your inventory.\n\n• \`\`/inventory\`\` View all the items that you possess and make use of them.\n\n• \`\`/leaderboard\`\` See the top 10 users with most credits in the server.');
        const helpEmbed2 = new EmbedBuilder()
            .setColor('#f26e6a')
            .setTitle('**Server Economy**')
            .setDescription('By chatting on this server, you can earn tokens which you can redeem for special items on the shop. The current system has the following specifications:\n\n• You can obtain tokens depending on the message length. The current system gives \`\`(0.1*messageLength)/(2.5+(0.00004*(messageLength^2)))*(2.5-(2.5*(e^(-0.2*(combo+1)))))\`\` tokens per message. The base tokens and the token cap scale with the current combo. \n\n• With every message you send every 5 seconds with a lenght greather than 20 characters you obtain a combo that gives you bonus tokens following the formula mentioned above. \n\n• You can only obtain tokens every 5 seconds. \n\n• If you stop chatting for 5 minutes your combo resets.\n\n• Any active token booster overrides the token limitation and might double or quadruple it, as the total amount of tokens you can earn is given by \`\`tokens earned after current token cap * boosters active\`\`.\n\n• You can only have one booster of each kind active at the time.\n\n• You obtain 20 extra credits for your first message on the day. \n\n• We might host random daily boost events with any multipliers. \n\n• If you\'re inactive for more than 14 days, your tokens will start to decay in a rhythm of 100 tokens per day. A decay immunity item might be added in the future. \n\n• Any sign of system exploitation will be punished by staff.\n\n• Commands channels are blacklisted. <#659669962587242526> is not blacklisted.\n\n• URLs, images and emojis do not give tokens.')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setFooter({ text: 'Note: Prices and Items on the shop might change at any given time.' });
        const helpEmbed3 = new EmbedBuilder()
            .setColor('#f26e6a')
            .setTitle('**Future plans**')
            .setDescription('There will be implementations that will be added into this system later on, which are the following:\n\n• You will be able to generate an unique referral code that you can use to invite your friends to the collabs. Once the user you invited completes 3 bumps you obtain an amount of tokens to be defined.\n\n• You will be able to set certain scores on certain maps given by future poolers in this server to obtain credits.\n\n• You will be able to obtain tokens by setting top 10 scores, with a bit of more weight for more skilled users.\n\n• **Any ideas and feedback for this economy is welcome!**')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png');
        int.reply({ content: ``, embeds: [helpEmbedTop, helpEmbed, helpEmbed2, helpEmbed3] });
    }    
}