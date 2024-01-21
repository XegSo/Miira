const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { editCache } = require('../buttons/edit-collab');

module.exports = {
    data: {
        name: `edit-collab`
    },
    async execute(int, client) {
        await int.deferReply();
        let editString = '';
        let clientClose = true;
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const collabToEdit = await localFunctions.getCollab(editCache.get(int.user.id).collab, collection);
        let name = int.fields.getTextInputValue('name');
        if (!name) {
            name = collabToEdit.name;
        } else {
            editString = editString.concat(`\n Name: ${name}`)
        }
        let topic = int.fields.getTextInputValue('topic');
        if (!topic) {
            topic = collabToEdit.topic;
        } else {
            editString = editString.concat(`\n Topic: ${topic}`)
        }
        let status = int.fields.getTextInputValue('status');
        if (!status) {
            status = collabToEdit.status;
        } else {
            switch (status) {
                case 'closed':
                    break;
                case 'open':
                    break;
                case 'on design':
                    break;
                case 'early access':
                    break;
                case 'full':
                    break;
                case 'delivered':
                    break;
                case 'completed':
                    break;
                default:
                    await int.editReply('Invalid Collab Status');
                    return;
            }
            editString = editString.concat(`\n Status: ${status}`)
        }
        let opening = int.fields.getTextInputValue('opening');
        if (!opening) {
            opening = collabToEdit.opening;
        } else if (!localFunctions.isUnixTimestamp(parseInt(opening))) {
            await int.editReply('Invalid date');
            return;
        } else {
            editString = editString.concat(`\n Date: <t:${opening}:R>`)
            clientClose = false;
        }
        let user_cap = int.fields.getTextInputValue('user_cap');
        if (!user_cap) {
            user_cap = collabToEdit.user_cap;
        } else if (typeof parseInt(user_cap) == "undefined") {
            await int.editReply('Invalid User Cap');
            return;
        } else {
            editString = editString.concat(`\n User Cap: ${user_cap}`)
        }
        try {
            await localFunctions.editCollab(collabToEdit.name, name, topic, status, parseInt(opening), parseInt(user_cap), collection);
            if (!clientClose) {
                await localFunctions.handleCollabOpenings(collection);
            }
            await int.editReply(`You've edited the following parameters:${editString}`);
        } finally {
            if (clientClose) {
                mongoClient.close();
            }
        }
    },
};