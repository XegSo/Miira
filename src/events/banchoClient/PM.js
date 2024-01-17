require('dotenv').config();
const banchoUsername = process.env.OSU_USERNAME_V1;
const { connectToMongoDB } = require('../../mongo');
const { v2 } = require('osu-api-extended');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    name: 'PM',
    async execute( message, user, discordClient) {
        if (user.ircUsername === banchoUsername) return;
        if (/^\d+$/.test(message.message) && message.message.length === 5) {
            const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
            const guild = discordClient.guilds.cache.get(localConstants.guildId);
            const logChannel = guild.channels.cache.get(localConstants.logChannelID);
            try {
                console.log(message.user.ircUsername);
                const query = await v2.site.search({ mode: "user", query: message.user.ircUsername });
                const correctedUsername = query.user.data[0].username;
                console.log(correctedUsername);
                const userDB = await localFunctions.getUserByOsuVerification(correctedUsername, collection);
                console.log(userDB.verificationData.code);
                if (userDB.verificationData && userDB.verificationData.code === parseInt(message.message)) {
                    await localFunctions.verifyUserBancho(correctedUsername, userDB.verificationData.user, collection);
                    console.log(`User ${correctedUsername} verified succesfully.`)
                    logChannel.send(`<@${userDB._id}> Your account has been linked!`);
                    return await message.user.sendMessage('You\'ve succesfully linked your osu! account! You can now join a collab in our discord server.');
                }
            } catch (e) {
                console.log('Error during verification')
                console.log(e);
            } finally {
                mongoClient.close();
            }    
        }
    }
}