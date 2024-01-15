const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.get(localConstants.welcomeChannelID);

        const canvas = Canvas.createCanvas(2800,646);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage("./assets/backgrounds/Welcome Discord.png");

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        localFunctions.ctxText(canvas, ctx, "#FFFFFF", member.user.username.toUpperCase(), "center", "Montserrat", 126, "medium italic", 1400, 495);

        ctx.beginPath();
        ctx.arc(1400, 201, 152, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "jpg", size: 2048 }));

        ctx.drawImage(avatar, 1248, 49, 304, 304);

        const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
            name: "welcome.png"
        });

        if (welcomeChannel) {
            welcomeChannel.send({content: `Welcome to the server <@${member.user.id}>! Make sure to read the <#991755017851781262> and check all the channels on the Endless Mirage server section!`, files: [attachment]});
        }
    }
}