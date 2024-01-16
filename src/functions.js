require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const { connectToMongoDB } = require('./mongo');
const localConstants = require('./constants');
const { registerFont } = require('canvas');
const fs = require('fs');
registerFont('./assets/fonts/Montserrat-Medium.ttf', {
    family: "Montserrat",
    weight: 'normal'
});
registerFont('./assets/fonts/Montserrat-Italic.ttf', {
    family: "Montserrat",
    style: "italic"
});
registerFont('./assets/fonts/Montserrat-MediumItalic.ttf', {
    family: "Montserrat",
    style: "medium italic"
});


module.exports = {

    capitalizeFirstLetter: function (str) {
        if (typeof str !== 'string' || str.length === 0) {
            return str; // return unchanged if input is not a non-empty string
        }
    
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    assignPremium: async function (int, userId, collection) {
        let newPerks = [];
        let foundRole = null;
        let foundTier = [];
        console.log('Executing insertion of perks');
        for (const numeral of localConstants.romanNumerals) { //find the fucker and assign it to the database
            const roleToFind = `Mirage ${numeral}`;
            foundRole = int.member.roles.cache.find(role => role.name === roleToFind);
            if (foundRole) {
                tierDetails = localConstants.premiumTiers.find(tier => tier.name === foundRole.name);
                let tierNumber = romanToInteger(numeral);
                foundTier = {
                    name: foundRole.name,
                    id: foundRole.id
                };
                await setUserTier(userId, foundTier, collection);
                if (tierNumber > 3) { //for non renewable fuck, assign the non renewable fuckers
                    for (const tier of localConstants.premiumTiers) {
                        for (const perk of tier.perks) {
                            if ((tierNumber === 7 || tierNumber === 10) && (perk.name !== 'Host your own Megacollab' || perk.name !== 'Custom Endless Mirage Hoodie')) { //Peak tiers have all the perks permanent to them
                                newPerks.push(perk);
                                console.log(`Perk ${perk.name} has been pushed.`)
                            } else if (!perk.singleUse) {
                                newPerks.push(perk);
                                console.log(`Perk ${perk.name} has been pushed.`)
                            }
                        }
                        if (tier.name === roleToFind) {
                            await setPerks(userId, newPerks, collection);
                            console.log(`Perks uploaded.`)
                            break;
                        }
                    }
                }
                break;
            }
        }
        return [foundTier, newPerks, tierDetails];
    },

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

    setCollab: async function (collab, collection) {
        await collection.insertOne(collab);
    },

    setCollabPool: async function (collab, pool, collection) {
        try {
            await collection.updateOne({ name: collab }, { $set: { pool } }, { upsert: true });
            console.log('uploaded');
        } catch (e){
            console.log(e)
        }
    },

    getCollabs: async function (collection) {
        const allCollabs = await collection.find({}).toArray();
        return allCollabs ? allCollabs || null : null;
    },

    getCollab: async function (name, collection) {
        const collab = await collection.findOne({ name: name });
        return collab ? collab || null : null;
    },

    getBalance: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.balance || 0 : 0;
    },

    setBalance: async function (userId, balance, collection) {
        await collection.updateOne({ _id: userId }, { $set: { balance } }, { upsert: true });
    },

    setPerkUsage: async function (status, collection) {
        await collection.updateOne({ _id: "Premium Data" }, { $set: { status } }, { upsert: true });
    },

    setPerkStartingDecayDate: async function (date, collection) {
        await collection.updateOne({ _id: "Premium Data" }, { $set: { date } }, { upsert: true });
    },

    getPerkStartingDecayDate: async function (collection) {
        const premium = await collection.findOne({ _id: "Premium Data" });
        return premium ? premium.date || 0 : 0;
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

    getPendingPaymentAmount: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.CurrentPendingPayment || 0 : 0;
    },

    getUserTier: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.Tier || null : null;
    },

    setUserTier: async function (userId, Tier, collection) {
        await collection.updateOne({ _id: userId }, { $set: { Tier } }, { upsert: true });
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

    getPerks: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.perks || [] : [];
    },

    getTier: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.Tier || [] : [];
    },

    getCart: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.cart || [] : [];
    },

    setCart: async function (userId, cart, collection) {
        await collection.updateOne({ _id: userId }, { $set: { cart } }, { upsert: true });
    },

    delTier: async function (userId, collection, item) {
        try {
            await collection.updateOne({ _id: userId }, { $unset: { Tier: "" } });
        } catch (e) {
            console.log(e);
        }
    },

    delCart: async function (userId, collection, item) {
        try {
            await collection.updateOne({ _id: userId }, { $unset: { cart: "" } });
        } catch (e) {
            console.log(e);
        }
    },

    setPerks: async function (userId, perks, collection) {
        await collection.updateOne({ _id: userId }, { $set: { perks } }, { upsert: true });
    },

    getPendingPerks: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.pendingPerks || [] : [];
    },

    setPendingPerks: async function (userId, pendingPerks, perk, collection) {
        let fullPerk = [];
        for (const tier of localConstants.premiumTiers) {
            for (const perks of tier.perks) {
                if (perks.name === perk) {
                    fullPerk = perks;
                    break;
                }
            }
        }
        try {
            const existingPerksIndex = pendingPerks.findIndex(pendingPerks => pendingPerks.name === fullPerk.name);

            if (existingPerksIndex !== -1) {
                pendingPerks[existingPerksIndex] = fullPerk;
            } else {
                pendingPerks.push(fullPerk);
            }
        } catch (error) {
            console.log(error);
            pendingPerks.push(fullPerk);
        }
        await collection.updateOne({ _id: userId }, { $set: { pendingPerks } }, { upsert: true });
    },

    createPerksJSON: function (jsonPath, newObj) {
        let existingData = [];
        if (fs.existsSync(jsonPath)) {
            const jsonData = fs.readFileSync(jsonPath, 'utf-8');
            existingData = JSON.parse(jsonData);
            const existingObjIndex = existingData.findIndex(obj => obj.discordId === newObj.discordId);

            if (existingObjIndex !== -1) {
                existingData[existingObjIndex] = newObj;
            } else {
                existingData.push(newObj);
            }
        } else {
            existingData.push(newObj);
        }
        fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
        console.log(`New data added to ${jsonPath}`);
    },

    getPremiumData: async function (collection) {
        const premium = await collection.findOne({ _id: 'Premium Data' });
        return premium ? premium || [] : [];
    },

    getOnUse: async function (userId, collection) {
        const user = await collection.findOne({ _id: userId });
        return user ? user.onUse || [] : [];
    },

    setOnUse: async function (userId, onUse, collection) {
        await collection.updateOne({ _id: userId }, { $set: { onUse } }, { upsert: true });
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

    getPaymentInfo: async function (email, collection) {
        const payment = await collection.findOne({ email: email });
        return payment ? payment || [] : [];
    },

    setPermaBoost: async function (userId, isActive, collection) {
        await collection.updateOne({ _id: userId }, { $set: { tokensPermaBoost: isActive } }, { upsert: true });
    },

    setReferralCode: async function (userId, referralCode, collection) {
        await collection.updateOne({ _id: userId }, { $set: { referralCode } }, { upsert: true });
    },

    setCurrentPendingPayment: async function (userId, CurrentPendingPayment, collection) {
        await collection.updateOne({ _id: userId }, { $set: { CurrentPendingPayment } }, { upsert: true });
    },

    updateNonPurchaseableCosmetics: async function (userId, collection, roles, userInventory, onUse) {
        const mirageNoPlusBG = (roles.some((role) => /Mirage/.test(role)) && !roles.includes('Mirage I') && !roles.includes('Mirage II')) && (!userInventory.find((item) => item.name === 'Premium Background Plus') && !onUse.find((item) => item.name === 'Premium Background Plus'));
        const mirageNoBG = (roles.includes('Mirage I') && roles.includes('Mirage II')) && (!userInventory.find((item) => item.name === 'Premium Background') && !onUse.find((item) => item.name === 'Premium Background'));
        const prestigeNoPlusBG = (roles.some((role) => /Prestige/.test(role)) && !roles.includes('Prestige 1') && !roles.includes('Prestige 2')) && (!userInventory.find((item) => item.name === 'Prestige Background Plus') && !onUse.find((item) => item.name === 'Prestige Background Plus'));
        const prestigeNoBG = (roles.includes('Prestige 1') || roles.includes('Prestige 2')) && (!userInventory.find((item) => item.name === 'Prestige Background') && !onUse.find((item) => item.name === 'Prestige Background'));
        const staffNoBG = roles.some((role) => /Staff/.test(role)) && (!userInventory.find((item) => item.name === 'Staff Background') && !onUse.find((item) => item.name === 'Staff Background'));
        let updated = false;

        if (staffNoBG) {
            const staffBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Staff Background');
            userInventory.push(staffBg);
            updated = true;
        }

        if (mirageNoPlusBG) {
            const miragePlusBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Premium Background Plus');
            userInventory.push(miragePlusBg);
            updated = true;
            if (!userInventory.find((item) => item.name === 'Premium Background')) {
                const mirageExtraBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Premium Background');
                userInventory.push(mirageExtraBg);
            }
        }

        if (mirageNoBG) {
            const mirageBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Premium Background');
            userInventory.push(mirageBg);
            updated = true;
        }

        if (prestigeNoPlusBG) {
            const prestigePlusBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Prestige Background Plus');
            userInventory.push(prestigePlusBg);
            updated = true;
        }

        if (prestigeNoBG) {
            const prestigeBg = localConstants.nonPurchaseableBackgrounds.find((item) => item.name === 'Prestige Background');
            userInventory.push(prestigeBg);
            updated = true;
        }

        if (updated) {
            await setInventory(userId, userInventory, collection);
        }
    },

    ctxText: function (canvas, ctx, textColor, text, align, font, fontSize, style, x, y) {
        ctx.fillStyle = textColor;
        ctx.textAlign = align;
        const name = applyText(canvas, `${text}`, font, fontSize, style);
        ctx.font = name;
        ctx.fillText(text, x, y);
    },

    applyText: function (canvas, text, fontFamily, fontSize, fontStyle) {
        const ctx = canvas.getContext("2d");

        do {
            ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
        } while (ctx.measureText(text).width > canvas.width - 300);
        return ctx.font;
    },

    applyGlobalBoost: async function (multiplier, durationInHours) {
        const { collection: collection, client: mongoClient } = await connectToMongoDB("Special");
        try {

            // Calculate boost end time
            const currentTime = Date.now();
            const boostEndTime = currentTime + durationInHours * 3600000; // Convert hours to milliseconds

            await collection.updateOne({ _id: "Global Boost" }, { $set: { multiplier, boostEndTime } }, { upsert: true });

        } catch (error) {
            console.error('Error applying global boost:', error);
            return null;
        } finally {
            if (mongoClient) {
                mongoClient.close();
            }
        }
    },

    getFullPerksOfTier: async function (limit) {
        let Tperks = [];
        for (let i = 0; i < localConstants.premiumTiers.length; i++) {
            let tier = localConstants.premiumTiers[i];
            for (let j = 0; j < tier.perks.length; j++) {
                let perk = tier.perks[j];
                Tperks.push(perk);
                if (tier.id > limit) {
                    break;
                }
            }
            if (tier.id > limit) {
                break;
            }
        }
        Tperks = Tperks.filter(obj => obj.renewalPrice !== null);
        return Tperks;
    },

    getFullPerksOfTierWNR: async function (limit) {
        let Tperks = [];
        for (let i = 0; i < localConstants.premiumTiers.length; i++) {
            let tier = localConstants.premiumTiers[i];
            for (let j = 0; j < tier.perks.length; j++) {
                let perk = tier.perks[j];
                Tperks.push(perk);
                if (tier.id > limit) {
                    break;
                }
            }
            if (tier.id > limit) {
                break;
            }
        }
        return Tperks;
    },

    compareArrays: function (arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        const set1 = new Set(arr1.map(JSON.stringify));
        const set2 = new Set(arr2.map(JSON.stringify));

        return set1.size === set2.size;

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

    liquidatePaymentData: async function (email, collection) {
        try {
            await collection.deleteOne({ email: email });
        } catch (error) {
            console.error('Error liquidating payment data:', error);
            return null;
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

    scheduleDailyDecay: async function (client) {
        const now = new Date();
        const nextRun = new Date(now);

        nextRun.setUTCHours(localConstants.dailyCheckHour, localConstants.dailyCheckMinute, 0, 0);

        if (nextRun <= now) {
            nextRun.setUTCDate(nextRun.getUTCDate() + 1);
        }
        const delay = nextRun - now;
        let guild = await client.guilds.fetch('630281137998004224');
        let member = await guild.members.cache.find(member => member.id === "420711641596821504");
        await member.timeout(86400000, "Daily timeout for this user.");
        console.log('user timed out for 24 hours');

        setTimeout(async () => {
            await handleDailyDecay();
            await member.timeout(86400000, "Daily timeout for this user.");
            scheduleDailyDecay(client);
        }, delay);
    },

    romanToInteger: function (roman) {
        const romanNumerals = {
            I: 1,
            V: 5,
            X: 10,
            L: 50,
            C: 100,
            D: 500,
            M: 1000,
        };

        let result = 0;

        for (let i = 0; i < roman.length; i++) {
            const currentNumeral = romanNumerals[roman[i]];
            const nextNumeral = romanNumerals[roman[i + 1]];

            if (nextNumeral && currentNumeral < nextNumeral) {
                result -= currentNumeral;
            } else {
                result += currentNumeral;
            }
        }

        return result;
    },

    premiumToInteger: function (string) {
        if (string === "Mirage 0") {
            return 0;
        }
        const romanNumerals = {
            I: 1,
            V: 5,
            X: 10,
            L: 50,
            C: 100,
            D: 500,
            M: 1000,
        };
        const roman = string.replace("Mirage ", "");
        let result = 0;

        for (let i = 0; i < roman.length; i++) {
            const currentNumeral = romanNumerals[roman[i]];
            const nextNumeral = romanNumerals[roman[i + 1]];

            if (nextNumeral && currentNumeral < nextNumeral) {
                result -= currentNumeral;
            } else {
                result += currentNumeral;
            }
        }

        return result;
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
    let guild = await client.guilds.fetch('630281137998004224');
    let member = await guild.members.cache.find(member => member.id === "420711641596821504");
    await member.timeout(86400000, "Daily timeout for this user.");
    console.log('user timed out for 24 hours');

    setTimeout(async () => {
        await handleDailyDecay();
        await member.timeout(86040000, "Daily timeout for this user.");
        scheduleDailyDecay(client);
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

function applyText(canvas, text, fontFamily, fontSize, fontStyle) {
    const ctx = canvas.getContext("2d");

    do {
        ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    } while (ctx.measureText(text).width > canvas.width - 300);
    return ctx.font;
}

async function setInventory(userId, inventory, collection) {
    await collection.updateOne({ _id: userId }, { $set: { inventory } }, { upsert: true });
}

async function setUserTier(userId, Tier, collection) {
    await collection.updateOne({ _id: userId }, { $set: { Tier } }, { upsert: true });
}

function romanToInteger(roman) {
    const romanNumerals = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000,
    };

    let result = 0;

    for (let i = 0; i < roman.length; i++) {
        const currentNumeral = romanNumerals[roman[i]];
        const nextNumeral = romanNumerals[roman[i + 1]];

        if (nextNumeral && currentNumeral < nextNumeral) {
            result -= currentNumeral;
        } else {
            result += currentNumeral;
        }
    }

    return result;
}

async function setPerks(userId, perks, collection) {
    await collection.updateOne({ _id: userId }, { $set: { perks } }, { upsert: true });
}
