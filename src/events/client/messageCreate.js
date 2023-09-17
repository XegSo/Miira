const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const userCooldowns = new Map();
const userCombos = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const userId = message.author.id;
        const currentTime = Date.now();

        // Check if the message starts with a blacklisted character
        if (localConstants.blacklistedChars.some((char) => message.content.startsWith(char))) {
            return;
        }

        // Check if the channel is blacklisted
        if (localConstants.blacklistedChannels.includes(message.channel.id)) {
            return;
        }

        // Check for cooldown
        if (userCooldowns.has(userId)) {
            const lastMessageTime = userCooldowns.get(userId);
            if (currentTime - lastMessageTime < localConstants.timeInterval) {
                return;
            }
        }

        // Define the start of the day for token bonus
        const startOfDay = new Date(currentTime);
        startOfDay.setHours(0, 0, 0, 0);

        // Establish a connection to MongoDB
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        const globalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
        const globalBoostEndTime = globalBoost.boostEndTime;
        const globalBoostValue = globalBoost.multiplier;

        messageCheck: try {
            const messageLength = localFunctions.removeURLsAndColons(message.content).length; // Clean and calculate the message length 
            if (messageLength == 0) {
                break messageCheck;
            }
            console.log(`User: ${message.author.tag}`);
            console.log(`Message length: ${messageLength}`);
            let tokensEarned;
            let tokensEarnedNB = (0.1 * messageLength) / (1 + (0.0001 * (messageLength ** 2))) * (2 - (2 * (Math.E ** (-0.2))));
            console.log(`Tokens earned without bonus: ${tokensEarnedNB}`);

            // Check if the user has an active combo
            if (userCombos.has(userId)) {
                const comboData = userCombos.get(userId);

                // Check if the user's combo is still active
                if (currentTime - comboData.lastMessageTime < localConstants.comboInterval) {
                    // Calculate combo bonus based on the time elapsed
                    console.log(`Current combo ${comboData.messages}`);
                    let comboBonus = comboData.messages;
                    tokensEarned = (0.1 * messageLength) / (1 + (0.0001 * (messageLength ** 2))) * (2 - (2 * (Math.E ** (-0.2 * (comboBonus + 1)))));
                    console.log(`Tokens earned with bonus: ${tokensEarned}`);
                    if (20 < messageLength) {
                        comboData.messages++; // Increment the number of messages in the combo
                    }
                    const topCombo = await localFunctions.getTopCombo(userId, collection); // Fetch top combo from the database
                    if (topCombo < comboData.messages) {
                        await localFunctions.setTopCombo(userId, comboData.messages, collection); // Store top combo in the database
                    }
                } else {
                    // Combo has expired, reset combo data
                    comboData.messages = 1; // Reset the message count
                    comboData.lastMessageTime = currentTime;
                    console.log(`User has lost its combo.`);
                    tokensEarned = tokensEarnedNB;
                    console.log(`Tokens earned: ${tokensEarned}`);
                }
            } else {
                // User doesn't have an active combo, start a new one
                userCombos.set(userId, {
                    messages: 1,
                    lastMessageTime: currentTime,
                });
                console.log(`Starting this user's combo.`);
                tokensEarned = tokensEarnedNB;
                console.log(`Tokens earned: ${tokensEarned}`);
            }

            const currentBalance = await localFunctions.getBalance(userId, collection); // Fetch user's balance from the database
            const hasLevel = localConstants.rolesLevel.some(roleName => message.member.roles.cache.some(role => role.name === roleName));

            if (!hasLevel) {
                if (currentBalance > 300) {
                    message.member.roles.add(localConstants.rolesLevel[2]);
                } else if (currentBalance > 100) {
                    message.member.roles.add(localConstants.rolesLevel[1]);
                } else if (currentBalance > 40) {
                    message.member.roles.add(localConstants.rolesLevel[0]);
                }
            }

            // Check if the user has an active boost
            const boostEndTime = await localFunctions.getBoostEndTime(userId, collection); // Fetch boost end time from the database
            if (boostEndTime && currentTime < boostEndTime) {
                // Apply a 2x boost to tokens earned
                tokensEarned *= 2;
                console.log(`Tokens earned with active boost: ${tokensEarned}`);
            }

            const PermaBoost = await localFunctions.getPermaBoost(userId, collection); // Fetch perma boost status from the database
            if (PermaBoost) {
                tokensEarned *= 2;
                console.log(`Tokens earned with active PERMA boost: ${tokensEarned}`);
            }

            const lastMessageDate = await localFunctions.getLastMessageDate(userId, collection); // Fetch the last message date for the user from the database

            if (globalBoostEndTime) {
                if (globalBoostEndTime < currentTime) {
                    console.log('Current global Boost has expired! Not applying.');
                } else {
                    tokensEarned *= globalBoostValue;
                    console.log(`Tokens earned with active Global boost: ${tokensEarned}`);
                }
            }

            if (!lastMessageDate || lastMessageDate < startOfDay.getTime()) {
                // It's the user's first message ever, give them an extra 20 tokens
                tokensEarned += 20;
                console.log('First message of the user, assigning 20 tokens bonus.');
            }

            //Update user's balance in the database
            const newBalance = currentBalance + tokensEarned;
            await localFunctions.setBalance(userId, newBalance, collection);

            // Store the date of the message in the database
            await localFunctions.setLastMessageDate(userId, currentTime, collection);

            // Set cooldown
            userCooldowns.set(userId, currentTime);

            // Log activity (optional)
            console.log(`${message.author.tag} earned ${tokensEarned} Mirage Tokens.\n`);
        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}