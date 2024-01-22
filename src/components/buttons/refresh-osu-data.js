const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { v2, tools } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: {
        name: 'refresh-osu-data'
    },
    async execute(int, client) {
        const userId = int.user.id;
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            const currentDate = new Date();
            let userOsu = await localFunctions.getOsuData(userId, collection);
            const userTop100 = await v2.scores.user.category(userOsu.osu_id, 'best', { mode: userOsu.playmode, limit: '100' });
            await int.editReply('Performing Skill Calculations and getting data analytics... This might take a minute or two.');
            const skills = await localFunctions.calculateSkill(userTop100, userOsu.playmode);
            let modsData = localFunctions.analyzeMods(userTop100);
            const filler = {
                mod: "--",
                percentage: "--"
            }
            let i = 0;
            while (i < 4) {
                if (typeof modsData.top4Mods[i] === "undefined") {
                    modsData.top4Mods.push(filler);
                }
                i++;
            }
            userOsu.skillRanks = skills;
            userOsu.modsData = modsData;
            await localFunctions.verifyUserManual(int.user.id, userOsu, collection);
            await localFunctions.setUserLastUpdate(userId, currentDate, collection);
            await int.editReply(`<@${int.user.id}> Your analytics have been updated!`);
        } finally {
            mongoClient.close();
        }
    },
};