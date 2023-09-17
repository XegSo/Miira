const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { connectToMongoDB } = require('../../mongo');
const { registerFont } = require('canvas');
const Canvas = require('canvas');
const localFunctions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows your server profile.'),
    async execute(int, client) {
        await int.deferReply();
        registerFont('./assets/fonts/Montserrat-Medium.ttf', {
            family: "Montserrat",
            weight: 'normal'
        });
        registerFont('./assets/fonts/Montserrat-Italic.ttf', {
            family: "Montserrat",
            style: "italic"
        });
        const applyText = (canvas, text, fontFamily, fontSize, fontStyle) => {
            const ctx = canvas.getContext("2d");

            do {
                ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
            } while (ctx.measureText(text).width > canvas.width - 300);
            return ctx.font;
        }
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

            let MirageFormat = Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            let formattedBalance = MirageFormat.format(existingBalance)

            let boosts = [];
            let badges = [];
            let userLevel = 'LEVEL 0';

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
                    const secondsRemainingGlobalBoost = remainingTimeGlobalBoost / 1000;
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

            let prestigeValue = null;
            let supporterValue = null;

            for (const item of badges) {
                const match = item.match(/Mirage (\w+)/);
                if (match) {
                    supporterValue = match[1];
                    break;
                }
            }

            if (!supporterValue) {
                for (const item of badges) {
                    const match = item.match(/Prestige (\d+)/);
                    if (match) {
                        prestigeValue = match[1];
                        break;
                    }
                }
            }

            let background = null;
            const staff = roles.includes("Staff");

            if (staff) {
                background = await Canvas.loadImage("./assets/backgrounds/Profile Staff.png");
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            } else if (supporterValue) {
                switch (supporterValue) {
                    case 'I':
                    case 'II':
                        background = await Canvas.loadImage("./assets/backgrounds/Profile Supporter Base.png");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        break;
                    case 'III':
                    case 'IV':
                    case 'V':
                    case 'VI':
                    case 'VII':
                    case 'VIII':
                    case 'X':
                        background = await Canvas.loadImage("./assets/backgrounds/Profile Supporter 3 Plus.png");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        break;
                }
            } else if (prestigeValue) {
                switch (prestigeValue) {
                    case '1':
                    case '2':
                        background = await Canvas.loadImage("./assets/backgrounds/Profile Prestige Base.png");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        break;
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                        background = await Canvas.loadImage("./assets/backgrounds/Profile Prestige 3 Plus.png");
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        break;
                }

            } else {
                background = await Canvas.loadImage("./assets/backgrounds/Profile.png");
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            }
            if (staff) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = "#f9e1e1";
            }
            ctx.textAlign = "start";
            var ntext = int.user.username.split("").join(String.fromCharCode(8202))
            const name = applyText(canvas, `${int.user.tag}`, 'Montserrat', 114, 'normal');
            ctx.font = name;
            ctx.fillText(ntext, 494, 120);

            if (staff) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = "#e2d8d8";
            }
            ctx.textAlign = "start";
            var btext = formattedBalance.split("").join(String.fromCharCode(8202))
            const balanceText = applyText(canvas, `${formattedBalance}`, 'Montserrat', 125, 'italic');
            ctx.font = balanceText;
            ctx.fillText(btext, 603, 436);

            if (staff) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = "#e2d8d8";
            }
            ctx.textAlign = "start";
            const comboFullText = `TOP COMBO: ${topCombo}`;
            var ctext = comboFullText.split("").join(String.fromCharCode(8202))
            const comboText = applyText(canvas, `${topCombo}`, 'Montserrat', 78, 'italic');
            ctx.font = comboText;
            ctx.fillText(ctext, 1777, 388);


            if (staff) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = "#e2d8d8";
            }
            ctx.textAlign = "start";
            var ltext = userLevel.split("").join(String.fromCharCode(8202))
            const levelText = applyText(canvas, `${userLevel}`, 'Montserrat', 78, 'italic');
            ctx.font = levelText;
            ctx.fillText(ltext, 1777, 511);

            let posyBoosts = 54;
            for (const boost of boosts) {
                if (staff) {
                    ctx.fillStyle = "#FFFFFF";
                } else {
                    ctx.fillStyle = "#b48585";
                }
                ctx.textAlign = "end";
                var botext = boost.split("").join(String.fromCharCode(8202))
                const boostText = applyText(canvas, `${boost}`, 'Montserrat', 34, 'normal');
                ctx.font = boostText;
                ctx.fillText(botext, 2764, posyBoosts);
                posyBoosts = posyBoosts + 50;
            }

            let posxBadges = 596;
            for (const badge of badges) {
                let badgeImage = await Canvas.loadImage(`./assets/badges/${badge}.png`);
                ctx.drawImage(badgeImage, posxBadges, 207, 92, 92);
                posxBadges = posxBadges + 160;
            }

            const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
                name: "welcome.png"
            });

            int.editReply({ files: [attachment] });


        } finally {
            mongoClient.close();
            mongoClientSpecial.close();
        }
    }
}