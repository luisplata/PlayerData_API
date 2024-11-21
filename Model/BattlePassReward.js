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

module.exports = {
    getRewardByLevel,
    createReward,
    updateReward,
    deleteReward
};