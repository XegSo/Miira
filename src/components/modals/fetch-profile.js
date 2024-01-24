const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { v2 } = require('osu-api-extended');
const fetchCache = new Map();

module.exports = {
    data: {
        name: `fetch-profile`
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        let name = int.fields.getTextInputValue('name');
        let mode = int.fields.getTextInputValue('mode');
        mode = mode.toLowerCase();
        switch (mode) {
            case 'osu':
                break;
            case 'mania':
                break;
            case 'fruits':
                break;
            case 'taiko':
                break;
            default:
                await int.editReply('Invalid gamemode. Please follow the modal placeholder guide for names.')
                return;

        }
        const query = await v2.site.search({ mode: "user", query: name })
        const protoUser = query.user.data[0];
        if (typeof protoUser === "undefined") {
            await int.editReply('User not found! Make sure you didn\'t make a typo.');
            return;
        }
        const user = await v2.user.details(protoUser.id, mode);
        const osuEmbed = new EmbedBuilder()
            .setFooter({ text: 'Endless Mirage | Link your osu! Account', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
            .setColor('#f26e6a')
            .setThumbnail(user.avatar_url)
            .setDescription(`**\`\`\`ml\n📌 Is this your osu! Account?\`\`\`**                                                                                    `)
            .addFields(
                {
                    name: `‎`,
                    value: `┌ Username: **${user.username}**\n├ Country: **${user.country.name}**\n├ Rank: **${user.statistics.global_rank}**\n├ Peak Rank: **${user.rank_highest.rank}**\n└ Level: **${user.statistics.level.current}**`,
                    inline: true
                },
                {
                    name: `‎`,
                    value: `┌ Performance: **${user.statistics.pp}pp**\n├ Join date: **<t:${new Date(user.join_date).getTime()/1000}:R>**\n├ Last online: **${user.last_visit ? `<t:${new Date(user.last_visit).getTime()/1000}:R>` : "Not Available"}**\n├ Followers: **${user.follower_count}**\n└ Playtime: **${Math.floor(user.statistics.play_time/3600)}h**`,
                    inline: true
                },
                {
                    name: `*You will be given a verification code to send via the osu! website*`,
                    value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:06:1195440954895765647><:08:1195440957735325707><:09:1195440958850998302><:11:1195441090677968936><:12:1195440961275306025><:14:1195441092947103847><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                }
            )
        user.osu_id = user.id;
        delete user.id;
        fetchCache.set(int.user.id, {
            osu_user: user,
        })
        const components = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify-osu')
                .setLabel('✅ Yes')
                .setStyle('Success'),
            new ButtonBuilder()
                .setCustomId('link-osu')
                .setLabel('❌ No')
                .setStyle('Danger'),
        )
        await int.editReply({
            content: '',
            embeds: [osuEmbed],
            components: [components]
        })
    },
    fetchCache: fetchCache
};