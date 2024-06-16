const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const userCooldowns = new Map();
const userCombos = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (message.guildId !== '630281137998004224') return;

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

        // Grab the MongoDB collections.
        const collection = client.db.collection('OzenCollection');
        const collectionSpecial = client.db.collection('Special');

        const globalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
        const globalBoostEndTime = globalBoost.boostEndTime;
        const globalBoostValue = globalBoost.multiplier;

        messageCheck: try {
            const messageLength = localFunctions.removeURLsAndColons(message.content).length;
            if (messageLength === 0) {
                break messageCheck;
            }
            let tokensEarned;
            let tokensEarnedNB = (0.1 * messageLength) / (0.5 + (0.00004 * (messageLength ** 2))) * (1.5 - (1.5 * (Math.E ** (-0.2))));

            if (userCombos.has(userId)) {
                const comboData = userCombos.get(userId);

                if (currentTime - comboData.lastMessageTime < localConstants.comboInterval) {
                    let comboBonus = comboData.messages;
                    comboData.lastMessageTime = currentTime;
                    tokensEarned = 20 * Math.log(Math.E, 4 * messageLength * -2.5) * (1.5 - (1.5 * (Math.E ** (-0.02 * (comboBonus + 1)))));
                    if (isNaN(tokensEarned)) {
                        tokensEarned = tokensEarnedNB;
                    }
                    if (messageLength > 20) {
                        comboData.messages++;
                        switch (comboData.messages) {
                        case 30:
                            message.react('💰');
                            tokensEarned += 100;
                            break;
                        case 60:
                            message.react('💰');
                            tokensEarned += 200;
                            break;
                        case 100:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 200:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 300:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        case 400:
                            message.react('💰');
                            tokensEarned += 300;
                            break;
                        }
                    }
                    const topCombo = await localFunctions.getTopCombo(userId, collection);
                    if (topCombo < comboData.messages) {
                        await localFunctions.setTopCombo(userId, comboData.messages, collection);
                    }
                } else {
                    comboData.messages = 1;
                    comboData.lastMessageTime = currentTime;
                    tokensEarned = tokensEarnedNB;
                }
            } else {
                userCombos.set(userId, {
                    messages: 1,
                    lastMessageTime: currentTime
                });
                tokensEarned = tokensEarnedNB;
            }

            const currentBalance = await localFunctions.getBalance(userId, collection);
            const currentXp = await localFunctions.getXp(userId, collection);
            const currentLevel = await localFunctions.getLevel(userId, collection);
            const newXp = currentXp + tokensEarned;

            const boostEndTime = await localFunctions.getBoostEndTime(userId, collection);
            if (boostEndTime && currentTime < boostEndTime) {
                // Apply a 2x boost to tokens earned
                tokensEarned *= 2;
            }

            const PermaBoost = await localFunctions.getPermaBoost(userId, collection);
            if (PermaBoost) {
                tokensEarned *= 2;
            }

            if (globalBoostEndTime) {
                if (globalBoostEndTime >= currentTime) {
                    tokensEarned *= globalBoostValue;
                }
            }

            const xpFunction = function (x) {
                return 450 + (50 * (x - 10)) / (1 + 0.01 * Math.abs(x - 10));
            };
            const xpForNextLevel = await localFunctions.trapezoidalRule(0, currentLevel, 1000, xpFunction);
            if (newXp > xpForNextLevel) {
                await localFunctions.setLevel(userId, currentLevel + 1, collection);
                if (currentLevel !== 0) {
                    message.reply(`Congratulations! You've achieved level ${currentLevel + 1}`);
                }
                switch (currentLevel + 1) {
                case 1:
                    message.member.roles.add(localConstants.rolesLevel[0]);
                    break;
                case 5:
                    message.member.roles.add(localConstants.rolesLevel[1]);
                    message.member.roles.remove(localConstants.rolesLevel[0]);
                    break;
                case 10:
                    message.member.roles.add(localConstants.rolesLevel[2]);
                    message.member.roles.remove(localConstants.rolesLevel[1]);
                    break;
                }
            }
            await localFunctions.setXp(userId, newXp, collection);
            const newBalance = currentBalance + tokensEarned;
            await localFunctions.setBalance(userId, newBalance, collection);

            await localFunctions.setLastMessageDate(userId, currentTime, collection);

            userCooldowns.set(userId, currentTime);
        } catch (e) {
            console.log(e);
        }
    }
};

