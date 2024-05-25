const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');
const { editCache } = require('../buttons/change-texts');

module.exports = {
    data: {
        name: "change-texts"
    },
    async execute(int, client) {
        await int.deferReply({ephemeral: true});
        let editString = '';
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        const { collection: collabCollection, client: mongoClientCollabs } = await connectToMongoDB("Collabs");
        const collabName = editCache.get(int.user.id).collab;
        const userLogChannel = guild.channels.cache.get(localConstants.userActionsLogChannelID);
        try {
            const userCollab = await localFunctions.getUserCollab(int.user.id, collection, collabName);
            let av_text = int.fields.getTextInputValue('av_text');
            if (!av_text) {
                av_text = userCollab.av_text;
            } else {
                editString = editString.concat(`\n Avatar text: ${av_text}`)
            }
            let ca_text = int.fields.getTextInputValue('ca_text');
            if (!ca_text) {
                ca_text = userCollab.ca_text;
            } else {
                editString = editString.concat(`\n Card text: ${ca_text}`)
            }
            let ca_quote = int.fields.getTextInputValue('ca_quote');
            if (!ca_quote) {
                ca_quote = userCollab.ca_quote;
            } else {
                editString = editString.concat(`\n Card quote: ${ca_quote}`)
            }
            await localFunctions.editParticipationFields(int.user.id, collabName, av_text, ca_text, ca_quote, collection);
            await localFunctions.editCollabUserFields(int.user.id, collabName, av_text, ca_text, ca_quote, collabCollection);
            const logEmbed = new EmbedBuilder()
                    .setFooter({ text: 'Endless Mirage | User Action Log', iconURL: 'https://puu.sh/JP9Iw/a365159d0e.png' })
                    .setColor('#f26e6a')
                    .setDescription(`**\`\`\`ml\n📣 New Text Field Changes\`\`\`**                                                                                                        **The fields of an user have been edited!**\n\n**Collab**: ${collabName}\n**Owner**: <@${int.user.id}>\n${editString}`);
            userLogChannel.send({ content: '', embeds: [logEmbed] });
            await int.editReply(`You've edited the following parameters:${editString}`);
        } finally {
            mongoClient.close();
            mongoClientCollabs.close();
        }
    },
};