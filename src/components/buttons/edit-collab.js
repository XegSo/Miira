const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { SlashCommandBuilder, EmbedBuilder, TextInputStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require('@discordjs/builders');
const { collabCache } = require('./admin-collab');
const editCache = new Map();

module.exports = {
    data: {
        name: 'edit-collab'
    },
    async execute(int, client) {
        await int.deferReply();
        if (collabCache.size === 0) {
            int.editReply('Open the dashboard again. The collab hasn\'t been cached');
            return;
        }
        
        if (int.user.id !== '687004886922952755') {
            await int.editReply('You are not allowed to do this!');
            return;
        }

        int.editReply('Please reply to this message with a JSON attatchment.');
        const replyMessage = await int.fetchReply();
        editCache.set(int.user.id, {
            collab: collabCache.get(int.user.id).collab,
            userId: int.user.id,
            messageId: replyMessage.id,

        })
    },
    editCache: editCache
}