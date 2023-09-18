const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('./mongo');
const localConstants = require('./constants');


module.exports = {
    removeURLsAndColons: function (content) {
        // Remove URLs (http, https, www) and colons
        return content.replace(/(https?:\/\/|www\.)[^\s]+|:[^\s]+:|<[^>]+>/g, '');
    },


    createLeaderboardEmbedTokens: function (data) {
        let MirageFormat = Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        const embed = new EmbedBuilder()
            .setColor('#f26e6a')
            .setTitle('Mirage Tokens Leaderboard.')
            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setTimestamp();
        for (let i = 0; i < data.length; i++) {
            const user = data[i];
            embed.addFields({ name: `\n`, value: `**${i + 1}**. <@${user.userId}> : $${MirageFormat.format(user.credits)} ₥` });
        }
        return embed;
    },

    createLeaderboardEmbedCombo: function (data) {
        const embed = new EmbedBuilder()
            .setTitle('Combo Leaderboard.')
            .setColor('#f26e6a')
            .setThumbnail('https://puu.sh/JP9Iw/a365159d0e.png')
            .setImage('https://puu.sh/JPffc/3c792e61c9.png')
            .setTimestamp();
        for (let i = 0; i < data.length; i++) {
            const user = data[i];
            embed.addFields({ name: `\n`, value: `**${i + 1}**. <@${user.userId}> : ${user.topCombo}` });
        }
        return embed;
    },

    getRoleIDByPrestige: function (prestige) {
        switch (prestige) {
            case '1': return '963258467928408134';
            case '2': return '963258497376583780';
            case '3': return '963258518767534080';
            case '4': return '963258542930931732';
            case '5': return '963258567425658910';
            case '6': return '963258579165524008';
            case '7': return '1071824409012219994';
            case '8': return '1146532857293045790';
            default: return null; // Handle unknown prestige level
        }
    },

    handleReferralCommand: async function (int) {
        const userId = int.user.id;
        const { collection, mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            // Check if the user already has a referral code
            let referralCode = await getReferralCode(userId, collection);

            if (!referralCode) {
                // Generate and check for a unique referral code
                referralCode = await generateUniqueReferralCode(userId, collection);

                // Store the referral code in the database
                await setReferralCode(userId, referralCode, collection);
            }

            return referralCode;
        } catch (error) {
            console.error('Error handling referral command:', error);
            return null; // Return null or an appropriate error code
        } finally {
            // Close the MongoDB connection if it's defined
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    generateUniqueReferralCode: async function (userId, collection) {
        while (true) {
            const newReferralCode = generateReferralCode();
            const existingUser = await collection.findOne({ referralCode: newReferralCode });

            if (!existingUser) {
                // The generated code is unique, store it and the user ID in the database
                await setReferralCode(userId, newReferralCode, collection);
                return newReferralCode;
            }
        }
    },

    generateReferralCode: function () {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const codeLength = 7;
        let referralCode = '';

        for (let i = 0; i < codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            referralCode += characters.charAt(randomIndex);
        }

        return referralCode;
    },

    // Helper functions for interacting with MongoDB

    getBalance: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.balance || 0 : 0;
    },

    setBalance: async function (userId, balance, collection) {
        await collection.updateOne({ _id: userId }, { $set: { balance } }, { upsert: true });
    },

    getBadges: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.badges || null : null;
    },

    updateBadges: function (roles) {
        console.log("Updating badges");
        let badges = [];
        if (roles.includes("Designer")) {
            badges.push('Designer');
        }
        if (roles.includes("Tournament")) {
            badges.push('Tournament');
        }
        if (roles.includes("Developer")) {
            badges.push('Developer');
        }
        if (roles.includes("Website Host")) {
            badges.push('Website Host');
        }
        if (roles.includes("Top Supporter")) {
            badges.push('Top Supporter');
        }
        if (roles.includes("Special Donator")) {
            badges.push('Special Donator');
        }
        if (roles.includes("Contrubitor")) {
            badges.push('Contrubitor');
        }
        if (roles.includes("Admin")) {
            badges.push('Admin');
        }
        if (roles.includes("AI")) {
            badges.push('AI');
        }
        if (roles.includes("Mod")) {
            badges.push('Mod');
        }
        if (roles.includes("Tourney Staff")) {
            badges.push('Tourney Staff');
        }
        if (roles.includes("Website Staff")) {
            badges.push('Website Staff');
        }
        if (roles.includes("Premium")) {
            for (const item of roles) {
                const match = item.match(/Mirage (\w+)/);
                if (match) {
                    badges.push(match[0]);
                    break; // Stop the loop once a match is found
                }
            }
        }
        if (roles.includes("Former Premium")) {
            badges.push('Former Premium');
        }
        if (roles.includes("Active Member")) {
            if (roles.includes("Novice")) {
                badges.push('Novice');
            }
            if (roles.includes("Advanced")) {
                badges.push('Advanced');
            }
            if (roles.includes("Ultimate")) {
                badges.push('Ultimate');
            }
        }
        if (roles.includes("Participant")) {
            for (const item of roles) {
                const match = item.match(/Prestige (\d+)/);
                if (match) {
                    badges.push(match[0]);
                    break; // Stop the loop once a match is found
                }
            }
        }
        if (roles.includes("Alumni")) {
            badges.push('Alumni');
        }
        return badges;
    },


    setBadges: async function (userId, badges, collection) {
        await collection.updateOne({ _id: userId }, { $set: { badges } }, { upsert: true });
    },

    getTopCombo: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.topCombo || 0 : 0;
    },

    setTopCombo: async function (userId, topCombo, collection) {
        await collection.updateOne({ _id: userId }, { $set: { topCombo } }, { upsert: true });
    },

    getBoostEndTime: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.tokensBoostEndTime || null : null;
    },

    getPermaBoost: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.tokensPermaBoost || false : false;
    },

    setLastMessageDate: async function (userId, lastMessageDate, collection) {
        await collection.updateOne({ _id: userId }, { $set: { lastMessageDate } }, { upsert: true });
    },

    getLastMessageDate: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.lastMessageDate || null : null;
    },

    getInventory: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.inventory || [] : [];
    },

    getGlobalBoost: async function (collection) {
        const globalBoost = await collection.findOne({ _id: "Global Boost" });
        return globalBoost ? globalBoost || [] : [];
    },

    setInventory: async function (userId, inventory, collection) {
        await collection.updateOne({ _id: userId }, { $set: { inventory } }, { upsert: true });
    },

    getBoostEndTime: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.tokensBoostEndTime || null : null;
    },

    setBoostEndTime: async function (userId, endTime, collection) {
        await collection.updateOne({ _id: userId }, { $set: { tokensBoostEndTime: endTime } }, { upsert: true });
    },

    getPermaBoost: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.tokensPermaBoost || false : false;
    },

    setPermaBoost: async function (userId, isActive, collection) {
        await collection.updateOne({ _id: userId }, { $set: { tokensPermaBoost: isActive } }, { upsert: true });
    },

    setReferralCode: async function (userId, referralCode, collection) {
        await collection.updateOne({ _id: userId }, { $set: { referralCode } }, { upsert: true });
    },


    applyGlobalBoost: async function (multiplier, durationInHours) {
        const { collection: collectionSpecial, client: mongoClient } = await connectToMongoDB("Special");
        try {

            // Calculate boost end time
            const currentTime = Date.now();
            const boostEndTime = currentTime + durationInHours * 3600000; // Convert hours to milliseconds

            await collectionSpecial.updateOne({ _id: "Global Boost" }, { $set: { multiplier, boostEndTime } }, { upsert: true });

        } catch (error) {
            console.error('Error applying global boost:', error);
            return null;
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    updateSuggestion: async function (messageId, user, status, embed, upvotes, downvotes, voters) {
        if (!voters) {
            let suggestion = await getSuggestion(messageId);
            voters = suggestion.voters;
        }
        const { collection: collectionSpecial, client: mongoClient } = await connectToMongoDB("Special");

        try {

            await collectionSpecial.updateOne({ _id: messageId }, { $set: { user, status, embed, upvotes, downvotes, voters } }, { upsert: true });

        } catch (error) {
            console.error('Error creating suggestion:', error);
            return null;
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    liquidateSuggestion: async function (messageId) {
        const { collection: collectionSpecial, client: mongoClient } = await connectToMongoDB("Special");

        try {

            await collectionSpecial.deleteOne({ _id: messageId });

        } catch (error) {
            console.error('Error liquidating suggestion:', error);
            return null;
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    getSuggestion: async function (messageId) {
        const { collection: collectionSpecial, client: mongoClient } = await connectToMongoDB("Special");

        try {
            const messageEmbed = await collectionSpecial.findOne({ _id: messageId });
            return messageEmbed ? messageEmbed || [] : [];
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    updateLeaderboardData: async function (type) {
        let leaderboardDataCombo = [];
        let leaderboardDataTokens = [];
        try {
            const userData = await fetchUserDataFromDatabase();
            if (type === 'tokens') {
                const sortedTokens = userData.sort((a, b) => b.credits - a.credits);
                return leaderboardDataTokens = sortedTokens.slice(0, 10); // Top 10 users by tokens
            } else {
                const sortedCombo = userData.sort((a, b) => b.topCombo - a.topCombo);
                return leaderboardDataCombo = sortedCombo.slice(0, 10); // Top 10 users by combo
            }
        } catch (error) {
            console.error('Error updating leaderboard data:', error);
        }
    },

    scheduleDailyDecay: async function () {
        const now = new Date();
        const nextRun = new Date(now);

        nextRun.setUTCHours(localConstants.dailyCheckHour, localConstants.dailyCheckMinute, 0, 0);

        if (nextRun <= now) {
            nextRun.setUTCDate(nextRun.getUTCDate() + 1);
        }

        const delay = nextRun - now;
        let member = await client.user.fetch('566899300643241987');
        await member.timeout(8640000, "Daily timeout for this user.");
        console.log('user timed out for 24 hours');

        setTimeout(async () => {
            await handleDailyDecay();
            await member.timeout(8640000, "Daily timeout for this user.");
            scheduleDailyDecay();
        }, delay);
    }
}

async function getReferralCode(userId, collection) {
    const user = await collection.findOne({ _id: userId });
    return user ? user.referralCode || null : null;
}

async function generateUniqueReferralCode(userId, collection) {
    while (true) {
        const newReferralCode = generateReferralCode();
        const existingUser = await collection.findOne({ referralCode: newReferralCode });

        if (!existingUser) {
            // The generated code is unique, store it and the user ID in the database
            await setReferralCode(userId, newReferralCode, collection);
            return newReferralCode;
        }
    }
}

function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 7;
    let referralCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
}

async function setReferralCode(userId, referralCode, collection) {
    await collection.updateOne({ _id: userId }, { $set: { referralCode } }, { upsert: true });
}

async function fetchUserDataFromDatabase() {
    // Establish a connection to MongoDB
    const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");

    try {
        const userData = await collection.find({}).toArray();
        const userDataArray = userData.map(user => ({
            userId: user._id,
            credits: user.balance || 0,
            topCombo: user.topCombo || 0
        }));

        return userDataArray;
    } finally {
        mongoClient.close();
    }
}

async function handleDailyDecay() {
    console.log("Running daily decay");

    // Establish a connection to MongoDB
    const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");

    try {
        const users = await collection.find({}).toArray();

        for (const user of users) {
            const lastMessageTimestamp = user.lastMessageDate;

            if (!lastMessageTimestamp) continue;

            const daysSinceLastMessage = (Date.now() - lastMessageTimestamp) / (1000 * 60 * 60 * 24);

            if (daysSinceLastMessage > 14) {
                const currentBalance = user.balance || 0;
                const newBalance = Math.max(currentBalance - 100, 0);

                await collection.updateOne(
                    { _id: user._id },
                    { $set: { balance: newBalance } }
                );
            }
        }
    } finally {
        mongoClient.close();
    }
}

async function scheduleDailyDecay(client) {
    const now = new Date();
    const nextRun = new Date(now);

    nextRun.setUTCHours(localConstants.dailyCheckHour, localConstants.dailyCheckMinute, 0, 0);

    if (nextRun <= now) {
        nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    const delay = nextRun - now;
    let member = await client.user.fetch('566899300643241987');
    await member.timeout(8640000, "Daily timeout for this user.");
    console.log('user timed out for 24 hours');

    setTimeout(async () => {
        await handleDailyDecay();
        await member.timeout(8640000, "Daily timeout for this user.");
        scheduleDailyDecay();
    }, delay);
}

async function getSuggestion(messageId) {
    const { collection: collectionSpecial, client: mongoClient } = await connectToMongoDB("Special");
    try {
        const messageEmbed = await collectionSpecial.findOne({ _id: messageId });
        return messageEmbed ? messageEmbed || [] : [];
    } finally {
        if (mongoClient) {
            mongoClient.close();
        }
    }
}