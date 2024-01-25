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
                let correctedUsername = query.user.data[0].username;
                console.log(correctedUsername);
                let userDB = await localFunctions.getUserByOsuVerification(correctedUsername, collection);
                let i = 1;
                while (typeof userDB.verificationData === "undefined") {
                    correctedUsername = query.user.data[i].username;
                    userDB = await localFunctions.getUserByOsuVerification(correctedUsername, collection);
                    i++;
                }
                console.log(userDB.verificationData.code);
                if (userDB.verificationData && userDB.verificationData.code === parseInt(message.message)) {
                    const currentData = userDB.verificationData.user;
                    console.log(userDB.verificationData.user);
                    await localFunctions.verifyUserBancho(correctedUsername, userDB.verificationData.user, collection);
                    console.log(`User ${correctedUsername} verified succesfully.`)
                    logChannel.send(`<@${userDB._id}> Your account has been linked!`);
                    await message.user.sendMessage('You\'ve succesfully linked your osu! account! You can now join a collab in our discord server. Currently a background calculation for your analytics is running. It might take a minute or two.');
                    const userTop100 = await v2.scores.user.category(currentData.osu_id, 'best', {mode: currentData.playmode, limit: '100'});
                    const skills = await localFunctions.calculateSkill(userTop100, currentData.playmode);
                    const modsData = localFunctions.analyzeMods(userTop100);
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
                    currentData.skillRanks = skills;
                    currentData.modsData = modsData;
                    await localFunctions.verifyUserManual(userDB._id, currentData, collection);
                    logChannel.send(`<@${userDB._id}> Your account analytics are ready! Run the \`\`/collabs profile\`\` command to visualize them.`);

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