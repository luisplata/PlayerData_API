/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if indexes exist before creating them (MySQL 5.7 compatible)
  const checkIndex = async (tableName, indexName) => {
    try {
      const result = await knex.raw(`
        SELECT COUNT(*) as count 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND INDEX_NAME = ?
      `, [tableName, indexName]);
      return result[0][0].count > 0;
    } catch (error) {
      return false;
    }
  };

  const createIndexIfNotExists = async (tableName, indexName, columns) => {
    const exists = await checkIndex(tableName, indexName);
    if (!exists) {
      try {
        await knex.raw(`CREATE INDEX ${indexName} ON ${tableName} (${columns})`);
        console.log(`Created index: ${indexName} on ${tableName}`);
      } catch (error) {
        console.log(`Index ${indexName} already exists or error: ${error.message}`);
      }
    } else {
      console.log(`Index ${indexName} already exists on ${tableName}`);
    }
  };

  // Players table indexes
  await createIndexIfNotExists('players', 'idx_players_playerId', 'playerId');
  await createIndexIfNotExists('players', 'idx_players_nickname', 'nickname');
  await createIndexIfNotExists('players', 'idx_players_created_at', 'created_at');

  // Battle passes table indexes
  await createIndexIfNotExists('battle_passes', 'idx_battle_passes_playerId', 'playerId');
  await createIndexIfNotExists('battle_passes', 'idx_battle_passes_level', 'level');
  await createIndexIfNotExists('battle_passes', 'idx_battle_passes_experience', 'experience');

  // Battle pass rewards table indexes
  await createIndexIfNotExists('battle_pass_rewards', 'idx_battle_pass_rewards_level', 'level');
  await createIndexIfNotExists('battle_pass_rewards', 'idx_battle_pass_rewards_created_at', 'created_at');

  // Player rewards table indexes
  await createIndexIfNotExists('player_rewards', 'idx_player_rewards_playerId', 'playerId');
  await createIndexIfNotExists('player_rewards', 'idx_player_rewards_rewardId', 'rewardId');
  await createIndexIfNotExists('player_rewards', 'idx_player_rewards_claimed', 'claimed');
  await createIndexIfNotExists('player_rewards', 'idx_player_rewards_awarded_at', 'awarded_at');
  await createIndexIfNotExists('player_rewards', 'idx_player_rewards_player_reward', 'playerId, rewardId');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Check if indexes exist before dropping them (MySQL 5.7 compatible)
  const checkIndex = async (tableName, indexName) => {
    try {
      const result = await knex.raw(`
        SELECT COUNT(*) as count 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND INDEX_NAME = ?
      `, [tableName, indexName]);
      return result[0][0].count > 0;
    } catch (error) {
      return false;
    }
  };

  const dropIndexIfExists = async (tableName, indexName) => {
    const exists = await checkIndex(tableName, indexName);
    if (exists) {
      try {
        await knex.raw(`DROP INDEX ${indexName} ON ${tableName}`);
        console.log(`Dropped index: ${indexName} from ${tableName}`);
      } catch (error) {
        console.log(`Error dropping index ${indexName}: ${error.message}`);
      }
    } else {
      console.log(`Index ${indexName} does not exist on ${tableName}`);
    }
  };

  // Drop all indexes
  await dropIndexIfExists('players', 'idx_players_playerId');
  await dropIndexIfExists('players', 'idx_players_nickname');
  await dropIndexIfExists('players', 'idx_players_created_at');

  await dropIndexIfExists('battle_passes', 'idx_battle_passes_playerId');
  await dropIndexIfExists('battle_passes', 'idx_battle_passes_level');
  await dropIndexIfExists('battle_passes', 'idx_battle_passes_experience');

  await dropIndexIfExists('battle_pass_rewards', 'idx_battle_pass_rewards_level');
  await dropIndexIfExists('battle_pass_rewards', 'idx_battle_pass_rewards_created_at');

  await dropIndexIfExists('player_rewards', 'idx_player_rewards_playerId');
  await dropIndexIfExists('player_rewards', 'idx_player_rewards_rewardId');
  await dropIndexIfExists('player_rewards', 'idx_player_rewards_claimed');
  await dropIndexIfExists('player_rewards', 'idx_player_rewards_awarded_at');
  await dropIndexIfExists('player_rewards', 'idx_player_rewards_player_reward');
};
