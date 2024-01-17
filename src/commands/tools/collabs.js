const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collabs')
        .setDescription('Collabs dashboard')
        .addSubcommand((subcommand) => subcommand.setName("info").setDescription('View all info about the collabs hosted since 2024.'))
        .addSubcommand((subcommand) => subcommand.setName("dashboard").setDescription('Manage your collab participations.'))
        .addSubcommand((subcommand) => subcommand.setName("create").setDescription('Create a collab.'))
        .addSubcommand((subcommand) => subcommand.setName("link").setDescription('Link your osu! account.')),
    async execute(int, client) {
        const subcommand = int.options.getSubcommand();
        const userId = int.user.id;
        if (subcommand === "create") {
            await int.deferReply({ ephemeral: true });
            if (userId !== '687004886922952755') {
                int.editReply('You are not allowed to do this.');
                return;
            }
        }
        if (subcommand === "link") {
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            try {
                let userOsuData = await localFunctions.getOsuData(userId, collection);
                if (userOsuData) {
                    int.editReply('You already have your osu! account linked!');
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`fetch-profile`)
                    .setTitle('Link your osu! account');

                const name = new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('Type your osu! name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                const mode = new TextInputBuilder()
                    .setCustomId('mode')
                    .setLabel('Type your main gamemode')
                    .setPlaceholder('osu | fruits | mania | taiko')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                modal.addComponents(new ActionRowBuilder().addComponents(name), new ActionRowBuilder().addComponents(mode));

                await int.showModal(modal);

            } finally {
                mongoClient.close();
            }
        }
        if (subcommand === "info") {
            await int.deferReply({ ephemeral: true });
            const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
            try {
                const dashboardEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | Collabs Dashboard', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`\n🏐 Endless Mirage | Collabs Dashboard\`\`\`**`)
                    .addFields(
                        {
                            name: `   **Please select a collab**`,
                            value: `<:01:1195440946989502614><:02:1195440949157970090><:03:1195440950311387286><:04:1195440951498391732><:05:1195440953616502814><:06:1195440954895765647><:07:1195440956057604176><:08:1195440957735325707><:09:1195440958850998302><:10:1195441088501133472><:11:1195441090677968936><:12:1195440961275306025><:13:1195441092036919296><:14:1195441092947103847><:15:1195441095811797123><:16:1195440964907573328><:17:1195441098768789586><:18:1195440968007176333><:19:1195441100350034063><:20:1195441101201494037><:21:1195441102585606144><:22:1195441104498212916><:23:1195440971886903356><:24:1195441154674675712><:25:1195441155664527410><:26:1195441158155931768><:27:1195440974978093147>`,
                        }
                    );
                const collabsMenu = new SelectMenuBuilder()
                    .setCustomId('select-collab')
                    .setPlaceholder('Select a collab to visualize.')
                const allCollabs = await localFunctions.getCollabs(collection);
                for (collab of allCollabs) {
                    collabsMenu.addOptions({ label: collab.name, value: collab.name });
                }
                const actionRow = new ActionRowBuilder().addComponents(collabsMenu);
                int.editReply({
                    content: '',
                    embeds: [dashboardEmbed],
                    components: [actionRow],
                })
            } catch (e) {
                console.log(e);
                int.editReply('Something went wrong...')
            } finally {
                mongoClient.close();
            }
        }
    },
}