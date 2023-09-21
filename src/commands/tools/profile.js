const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const { registerFont } = require('canvas');
const Canvas = require('canvas');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows your server profile.'),
    async execute(int, client) {
        await int.deferReply();
        const date = Date.now();
        const userId = int.user.id;
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collectionSpecial, client: mongoClientSpecial } = await connectToMongoDB("Special");
        try {
            const NormalBoostboostEndTime = await localFunctions.getBoostEndTime(userId, collection);
            const remainingTimeNormalBoost = NormalBoostboostEndTime ? NormalBoostboostEndTime - date : 0;
            const PermaBoost = await localFunctions.getPermaBoost(userId, collection);
            const GlobalBoost = await localFunctions.getGlobalBoost(collectionSpecial);
            const GlobalBoostTime = GlobalBoost.boostEndTime;
            const remainingTimeGlobalBoost = GlobalBoost ? GlobalBoost.boostEndTime : 0;
            const GlobalBoostMultiplier = GlobalBoost ? GlobalBoost.multiplier : 0;

            const balance = await localFunctions.getBalance(userId, collection);
            const existingBalance = balance ? balance : 0;
            const topCombo = await localFunctions.getTopCombo(userId, collection) || 0;

            let userInventory = await localFunctions.getInventory(userId, collection) || [];

            let onUse = await localFunctions.getOnUse(userId, collection);

            let MirageFormat = Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            let formattedBalance = MirageFormat.format(existingBalance)

            let boosts = [];
            let badges = [];
            let userLevel = 'LEVEL 0';
            let textColor = "#f9e1e1";
            const comboFullText = `TOP COMBO: ${topCombo}`;;

            const roles = int.member.roles.cache.map(role => role.name);
            const badgesDB = await localFunctions.getBadges(userId, collection);

            if (badgesDB) {
                badges = badgesDB;
            } else {
                badges = localFunctions.updateBadges(roles);
                await localFunctions.setBadges(userId, badges, collection);
            }

            if (roles.includes("Level 3")) {
                userLevel = "LEVEL 3";
            } else if (roles.includes("Level 2")) {
                userLevel = "LEVEL 2";
            } else if (roles.includes("Level 1")) {
                userLevel = "LEVEL 1";
            }

            if (remainingTimeNormalBoost) {
                if (remainingTimeNormalBoost > 0) {
                    const secondsRemainingNormalBoost = remainingTimeNormalBoost / 1000;
                    if (secondsRemainingNormalBoost < 60) {
                        boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost)} SECONDS`);
                    }
                    if (secondsRemainingNormalBoost < 3600) {
                        boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost / 60)} MINUTES`);
                    }
                    if (secondsRemainingNormalBoost > 3600) {
                        boosts.push(`2X TOKEN BOOST EXPIRING IN ${Math.round(secondsRemainingNormalBoost / 3600)} HOURS`);
                    }
                }
            }

            if (GlobalBoostTime) {
                if (GlobalBoostTime > date) {
                    const secondsRemainingGlobalBoost = (remainingTimeGlobalBoost - date) / 1000;
                    if (secondsRemainingGlobalBoost < 60) {
                        boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost)} SECONDS`);
                    }
                    if (secondsRemainingGlobalBoost < 3600) {
                        boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost / 60)} MINUTES`);
                    }
                    if (secondsRemainingGlobalBoost > 3600) {
                        boosts.push(`${GlobalBoostMultiplier}X GLOBAL BOOST EXPIRING IN ${Math.round(secondsRemainingGlobalBoost / 3600)} HOURS`);
                    }
                }
            }

            if (PermaBoost) {
                boosts.push('PERMANENT 2X TOKEN BOOST');
            }

            const canvas = Canvas.createCanvas(2800, 646);
            const ctx = canvas.getContext('2d');

            const avatar = await Canvas.loadImage(int.user.displayAvatarURL({ extension: "jpg", size: 2048 }));

            ctx.drawImage(avatar, 30, 30, 510, 510);

            if (!onUse.length && !userInventory.length) { //Updates cosmetics if the user doesn't have them
                localFunctions.updateNonPurchaseableCosmetics(userId, collection, roles, userInventory, onUse)
            }
            
            let backgroundName = onUse.find((item) => item.type === 'background').name || 'Profile';
            if (backgroundName === "Staff Background") {
                textColor = "#FFFFFF";
            }

            background = await Canvas.loadImage(`./assets/backgrounds/${backgroundName}.png`);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            localFunctions.ctxText(canvas, ctx, textColor, int.user.username.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 114, 'normal', 494, 120);

            localFunctions.ctxText(canvas, ctx, textColor, formattedBalance.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 125, 'italic', 603, 436);

            localFunctions.ctxText(canvas, ctx, textColor, comboFullText.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 78, 'italic', 1777, 388);

            localFunctions.ctxText(canvas, ctx, textColor, userLevel.split("").join(String.fromCharCode(8202)), 'start', 'Montserrat', 78, 'italic', 1777, 511);

            let posyBoosts = 54;
            for (const boost of boosts) {
                localFunctions.ctxText(canvas, ctx, textColor, boost.split("").join(String.fromCharCode(8202)), 'end', 'Montserrat', 34, 'Normal', 2764, posyBoosts);
                posyBoosts = posyBoosts + 50;
            }

            let posxBadges = 596;
            for (const badge of badges) {
                let badgeImage = await Canvas.loadImage(`./assets/badges/${badge}.png`);
                ctx.drawImage(badgeImage, posxBadges, 207, 92, 92);
                posxBadges = posxBadges + 160;
            }

            const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
                name: "profile.png"
            });

            int.editReply({ files: [attachment] });


        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}