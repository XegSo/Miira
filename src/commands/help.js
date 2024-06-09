const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display info for all the commands.'),
    async execute(int, client) {

        const helpEmbed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setTitle('**Miira Commands**')
            .setDescription('**\`\`\`ml\n🧭 Server Commands\`\`\`**                                                                                                         • \`\`/help\`\` Displays this message.\n\n• \`\`/server profile\`\` Displays your server profile with your Balance, Top message Combo and Current token Booster.\n\n• \`\`/server shop\`\` Use this command to view the server shop and make a purchase of an item. Once you purchase an item it will go into your inventory.\n\n• \`\`/server inventory\`\` View all the items that you possess and make use of them.\n\n• \`\`/server leaderboard\`\` See the top 10 users with most credits or more combo in the server.\n\n• \`\`/server daily\`\` Claim daily tokens.\n\n• \`\`/server suggest\`\` Make a suggestion for the server.')
            .setFooter({ text: 'Endless Mirage | Help Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .addFields(
                {
                    name :"‎",
                    value: '**\`\`\`ml\n🔮 Collab Commands\`\`\`**                                                                                                         • \`\`/collabs join\`\` Display a dashboard with all the collabs you can join.\n\n• \`\`/collabs manage\`\` Manage your past and current collab participations.\n\n• \`\`/collabs info\`\` Visualize all the collabs that have been hosted since 2024.\n\n• \`\`/collabs profile\`\` Manage your collab profile.\n\n• \`\`/collabs link\`\` Link your osu! account to the bot.\n\n• \`\`/collabs premium\`\` Support us!\n\n• \`\`/collabs perks\`\` Manage your premium perks.\n\n• \`\`/collabs feedback\`\` Send feedback to us regarding the collabs.\n\n• \`\`/collabs referral\`\` Obtain a referral code, invite your friends and obtain 2000 tokens everytime they bump.',
                },
                {
                    name :"‎",
                    value: '**\`\`\`ml\n🏐 Megacollab Commands\`\`\`**                                                                                                         • \`\`/collabs quick join\`\` Join an open megacollab with a simple command.\n\n• \`\`/collabs quick join-random\`\` Join an open megacollab with a simple command and a random pick.\n\n• \`\`/collabs quick swap\`\` Swap your megacollab pick with a simple command.\n\n• \`\`/collabs quick trade\`\` Open a trade request with another user.\n\n• \`\`/collabs quick pick-check\`\` Check the status of a pick.\n\n• \`\`/collabs quick user-check\`\` Check the entry of another user.\n\n• \`\`/collabs quick snipe\`\` Obtain a notification if a character becomes available.\n\n• \`\`/collabs quick bump\`\` Bump your collab participation if there is an active bump ongoing.',
                },
                {
                    name: "‎",
                    value: "<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>",
                },
            )

        int.reply({ content: "", embeds: [helpEmbed], ephemeral: true });
    }    
}