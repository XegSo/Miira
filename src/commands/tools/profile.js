const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const { connectToMongoDBSpecial } = require('../../mongoSpecial');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows your current Mirage Balance.'),
    async execute(int, client) {
        await int.deferReply();
        const date = Date.now();
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB();
        const { collectionSpecial, client: mongoClientSpecial } = await connectToMongoDBSpecial();
        try {
            const NormalBoostboostEndTime = await localFunctions.getBoostEndTime(userId, collection);
            const remainingTimeNormalBoost = NormalBoostboostEndTime ? NormalBoostboostEndTime - date : 0;
            const balance = await localFunctions.getBalance(userId, collection);
            const topCombo = await localFunctions.getTopCombo(userId, collection) || 0;
            const PermaBoost = await localFunctions.getPermaBoost(userId, collection);
            const GlobalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
            const GlobalBoostTime = GlobalBoost.boostEndTime;
            const remainingTimeGlobalBoost = GlobalBoost ? GlobalBoost.boostEndTime : 0;
            const GlobalBoostMultiplier = GlobalBoost ? GlobalBoost.multiplier : 0;
            let NormalBoostTimeString = '';
            let PermaBoostString = '';
            let GlobalBoostString = '';
            if (remainingTimeNormalBoost > 0) {
                const timestampNormalBoost = Math.floor(new Date(date + remainingTimeNormalBoost) / 1000);
                NormalBoostTimeString = `• 2x Token Boost is active and will expire <t:${timestampNormalBoost}:R>.\n`;
            }
            if (GlobalBoostTime > date) {
                const timestampGlobalBoost = Math.floor(new Date(remainingTimeGlobalBoost) / 1000);
                GlobalBoostString = `• ${GlobalBoostMultiplier}x Global Token Boost is active and will expire <t:${timestampGlobalBoost}:R>.\n`;
            }
            if (PermaBoost) {
                PermaBoostString = '• This user has a permanent 2x token boost! How awesome!';
            }
            const profileEmbed = new EmbedBuilder()
                .setAuthor({ name: `${int.user.tag}'s Profile`, iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setThumbnail(int.user.displayAvatarURL())
                .setColor('#f26e6a')
                .setImage('https://puu.sh/JPffc/3c792e61c9.png')
                .addFields(
                { name: `Current balance: ${localConstants.MirageFormat.format(balance)} ₥`, value: `• Top combo: ${topCombo}\n${NormalBoostTimeString}${GlobalBoostString}${PermaBoostString}` }
                );
            //.addFields({ name: `\n`, value: `Collabs participated: TBD` })
        
            if (balance === null) {
                int.editReply("You don't have any Mirage Tokens yet.");
            } else {
                int.editReply({ content: '', embeds: [profileEmbed] });
            }
        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }    
}