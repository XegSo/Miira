const { v2 } = require('osu-api-extended');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'refresh-osu-data'
    },
    async execute(int, client) {
        const userId = int.user.id;
        await int.deferReply({ ephemeral: true });
        const collection = client.db.collection('OzenCollection');
        const collabCollection = client.db.collection('Collabs');
        const currentDate = Math.floor(new Date().getTime() / 1000);

        try {
            let userOsu = await localFunctions.getOsuData(userId, collection);
            const userTop100 = await v2.scores.user.category(userOsu.osu_id, 'best', { mode: userOsu.playmode, limit: '100' });
            if (typeof userTop100 !== 'undefined') {
                await int.editReply('Performing Skill Calculations and getting data analytics... This might take a minute or two.');
            } else if (typeof userTop100 === 'undefined' || !userTop100) {
                return int.editReply('There was an error fetching your top 100 scores...');
            }
            const skills = await localFunctions.calculateSkill(userTop100, userOsu.playmode);
            let modsData = await localFunctions.analyzeMods(userTop100);
            const filler = {
                mod: '--',
                percentage: '--'
            };
            let i = 0;
            while (i < 4) {
                if (typeof modsData.top4Mods[i] === 'undefined') {
                    modsData.top4Mods.push(filler);
                }
                i++;
            }
            userOsu.skillRanks = skills;
            userOsu.modsData = modsData;
            const newUserData = await v2.user.details(userOsu.osu_id, userOsu.playmode);
            userOsu.country_code = newUserData.country_code;
            userOsu.is_supporter = newUserData.is_supporter;
            userOsu.follower_count = newUserData.follower_count;
            userOsu.rank_highest = newUserData.rank_highest;
            userOsu.statistics = newUserData.statistics;
            userOsu.cover_url = newUserData.cover_url;

            await localFunctions.verifyUserManual(int.user.id, userOsu, collection);
            await localFunctions.setUserLastUpdate(userId, currentDate, collection);
            let userOsuDataFull = await localFunctions.getOsuData(userId, collection);
            userOsuDataFull = localFunctions.flattenObject(userOsuDataFull);
            await localFunctions.editCollabUserOsuData(int.user.id, userOsuDataFull, collabCollection);
            await int.editReply(`<@${int.user.id}> Your analytics have been updated!`);
        } catch (e) {
            console.log(e);
            await int.editReply('There was an error fetching your top 100 scores, probably because there isn\'t any play on your profile. If you think this is a mistake please contact the Owner.');
            let userOsu = await localFunctions.getOsuData(userId, collection);
            let finalSkillsPrototipe = [
                { skill: 'Accuracy', value: 0 },
                { skill: 'Reaction', value: 0 },
                { skill: 'Aim', value: 0 },
                { skill: 'Speed', value: 0 },
                { skill: 'Stamina', value: 0 },
                { skill: 'Precision', value: 0 }
            ];
            const skillDefaultData = finalSkillsPrototipe.map((skill) => {
                return {
                    skill: skill.skill,
                    rank: 'F',
                    int: Math.round(skill.value)
                };
            });
            let i = 0;
            const filler = {
                mod: '--',
                percentage: '--'
            };
            let top4Mods = [];
            let mostCommonModCombination;
            while (i < 4) {
                top4Mods.push(filler);
                i++;
            }
            let modsData = [
                top4Mods,
                mostCommonModCombination
            ];
            modsData.mostCommonModCombination = '--';
            userOsu.skillRanks = skillDefaultData;
            userOsu.modsData = modsData;
            await localFunctions.verifyUserManual(int.user.id, userOsu, collection);
            await localFunctions.setUserLastUpdate(userId, currentDate, collection);
        }
    }
};
