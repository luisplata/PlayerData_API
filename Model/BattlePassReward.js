const db = require('../DB/db.js');

const getRewardByLevel = async (level) => {
    return await db('battle_pass_rewards').where({ level }).first();
};

const createReward = async (level, reward) => {
    return await db('battle_pass_rewards')
        .insert({ level, reward });
};

const updateReward = async (id, reward) => {
    return await db('battle_pass_rewards')
        .where({ id })
        .update({ reward });
};

const deleteReward = async (id) => {
    return await db('battle_pass_rewards')
        .where({ id })
        .del();
};

const getRewards = async () => {
    const rewards = await db('battle_pass_rewards').select();

    return rewards.map(r => {
        let parsedReward = null;

        try {
            parsedReward = JSON.parse(r.reward);

            // stringify solo body
            if (parsedReward.body && typeof parsedReward.body === 'object') {
                parsedReward.body = JSON.stringify(parsedReward.body);
            }
        } catch (err) {
            parsedReward = r.reward; // fallback si no es JSON válido
        }

        return {
            ...r,
            reward: parsedReward
        };
    });
};


module.exports = {
    getRewardByLevel,
    createReward,
    updateReward,
    deleteReward,
    getRewards
};