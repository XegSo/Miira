const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pong'),
    async execute(int) {
        await int.reply('pong');
    }
};
