const { EmbedBuilder } = require('discord.js');
const localFunctions = require('../../functions');
const localConstants = require('../../constants');
const { connectToMongoDB } = require('../../mongo');

module.exports = {
    data: {
        name: 'swap-image-approve'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true })
        const request = await localFunctions.getImageRequestByMessage(int.message.id);
        const guild = client.guilds.cache.get(localConstants.guildId);
        const guildMember = guild.members.cache.get(int.user.id);
        if (!guildMember.roles.cache.has('630636502187114496')) return int.editReply('You have no permission to do this!');
        if (typeof request === "undefined") return int.editReply('Something went wrong...');

        const newImgURL = request.imgURL;
        const { collection: userCollection, client: mongoClientUsers } = await connectToMongoDB("OzenCollection");
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        try {
            await localFunctions.editPickImage(request.pickId, request.user, request.collab, collabCollection, userCollection, newImgURL);
            const logChannel = guild.channels.cache.get(localConstants.logChannelID);
            let imageSwapEmbed = new EmbedBuilder()
                .setFooter({ text: "Endless Mirage | Accepted Request", iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                .setColor('#f26e6a')
                .setTimestamp()
                .setImage(request.imgURL)
                .setURL('https://endlessmirage.net/')
                .setDescription(`**\`\`\`🏐 Accepted Image Request!\`\`\`**`)
                .addFields(
                    {
                        name: request.embed.data.fields[0].name,
                        value: request.embed.data.fields[0].value
                    },
                    {
                        name: request.embed.data.fields[1].name,
                        value: request.embed.data.fields[1].value
                    }
                )

            let oldImageEmbed = new EmbedBuilder()
                .setURL('https://endlessmirage.net/')
                .setImage(request.oldImgURL)
            await int.message.edit({ embeds: [imageSwapEmbed, oldImageEmbed], components: [] });
            await logChannel.send({ content: `<@${request.user}> Your image change request has been accepted!`, embeds: [imageSwapEmbed, oldImageEmbed] });
            await localFunctions.liquidateImageRequest(request._id);
            await int.editReply({ content: 'Request successfully accepted.', ephemeral: true });

        } finally {
            mongoClientUsers.close();
            mongoClientCollabs.close();
        }

    },
};