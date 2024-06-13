const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'empty-cart'
    },
    async execute(int, client) {
        await int.deferReply({ ephemeral: true });
        const userId = int.user.id;
        const collection = client.db.collection('OzenCollection');

        await localFunctions.delCart(userId, collection);
        await int.editReply('Your cart is now empty.');
    }
};
