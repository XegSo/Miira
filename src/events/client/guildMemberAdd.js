const localConstants = require('../../constants');
const { registerFont } = require('canvas');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.get(localConstants.welcomeChannelID);
        registerFont('Montserrat-MediumItalic.ttf', {
            family: "Montserrat"
        });

        const applyText = (canvas, text) => {
            const ctx = canvas.getContext("2d");

            let fontsize = 126;

            do {
                ctx.font = `${fontsize -= 10}px Montserrat`
            } while (ctx.measureText(text).width > canvas.width - 300);
            return ctx.font;
        }

        const canvas = Canvas.createCanvas(2800,646);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage("./Welcome Discord.png");

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = applyText(canvas, `${member.user.tag}`);

        ctx.letterSpacing = 200;

        ctx.fillText(member.user.username.toUpperCase(), 1400, 495);

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