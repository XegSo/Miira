const path = require('path');
const { connectToMongoDB } = require('../../mongo');
const localConstants = require('../../constants');
const localFunctions = require('../../functions');
const { collabCache } = require('../buttons/set-fields');

module.exports = {
    data: {
        name: "set-fields"
    },
    async execute(int, client) {
        await int.deferReply();
        const { collection, client: mongoClient } = await connectToMongoDB("Collabs");
        const collabToEdit = await localFunctions.getCollab(collabCache.get(int.user.id).collab, collection);

        let av_limit = parseInt(int.fields.getTextInputValue('av_text'));
        if (!av_limit) {
            av_limit = collabToEdit.fieldRestrictions.av;
        } 
        let ca_limit = parseInt(int.fields.getTextInputValue('ca_text'));
        if (!ca_limit) {
            ca_limit = collabToEdit.fieldRestrictions.ca;
        } 
        let ca_quote_limit = parseInt(int.fields.getTextInputValue('ca_quote'));
        if (!ca_quote_limit) {
            ca_quote_limit = collabToEdit.fieldRestrictions.ca_quote;
        } 

        const fieldRestrictions = {
            av: av_limit,
            ca: ca_limit,
            ca_quote: ca_quote_limit,
        };
        try {
            await localFunctions.setCollabTexts(collabToEdit.name, fieldRestrictions, collection);
            await int.editReply("Parameters for limiting characters have been set.");
            collabCache.delete(int.user.id);
        } finally {
            mongoClient.close();
        }
    },
};