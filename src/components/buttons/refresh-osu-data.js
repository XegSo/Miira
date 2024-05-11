const { v2 } = require('osu-api-extended');
const { connectToMongoDB } = require('../../mongo');
const localFunctions = require('../../functions');

module.exports = {
    data: {
        name: 'refresh-osu-data'
    },
    async execute(int) {
        const userId = int.user.id;
        await int.deferReply({ ephemeral: true });
        const { collection, client: mongoClient } = await connectToMongoDB("OzenCollection");
        try {
            const currentDate = new Date();
            let userOsu = await localFunctions.getOsuData(userId, collection);
            const userTop100 = await v2.scores.user.category(userOsu.osu_id, 'best', { mode: userOsu.playmode, limit: '100' });
            if (typeof userTop100 !== "undefined") {
                await int.editReply('Performing Skill Calculations and getting data analytics... This might take a minute or two.');
            }
            const skills = await localFunctions.calculateSkill(userTop100, userOsu.playmode);
            let modsData = localFunctions.analyzeMods(userTop100);
            const filler = {
                mod: "--",
                percentage: "--"
            }
            let i = 0;
            while (i < 4) {
                if (typeof modsData.top4Mods[i] === "undefined") {
                    modsData.top4Mods.push(filler);
                }
                i++;
            }
            userOsu.skillRanks = skills;
            userOsu.modsData = modsData;
            await localFunctions.verifyUserManual(int.user.id, userOsu, collection);
            await localFunctions.setUserLastUpdate(userId, currentDate, collection);
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
                { skill: 'Precision', value: 0 },
            ];
            const skillDefaultData = finalSkillsPrototipe.map((skill) => {  
                return {
                    skill: skill.skill,
                    rank: 'F',
                    int: Math.round(skill.value),
                };
            });
            let i = 0;
            const filler = {
                mod: "--",
                percentage: "--"
            }
            let top4Mods = {};
            let mostCommonModCombination;
            let modsData = [
                top4Mods,
                mostCommonModCombination,
            ]
            while (i < 4) {
                modsData.top4Mods.push(filler);
                i++;
            }
            modsData.mostCommonModCombination = "--";
            userOsu.skillRanks = skillDefaultData;
            userOsu.modsData = modsData;
            await localFunctions.verifyUserManual(int.user.id, userOsu, collection);
            await localFunctions.setUserLastUpdate(userId, currentDate, collection);
        } finally {
            mongoClient.close();
        }
    },
};