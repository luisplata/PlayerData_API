/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return Promise.all([
    // Players table indexes
    knex.schema.alterTable('players', (table) => {
      table.index('playerId', 'idx_players_playerId');
      table.index('nickname', 'idx_players_nickname');
      table.index('createdAt', 'idx_players_createdAt');
    }),
    
    // Battle passes table indexes
    knex.schema.alterTable('battle_passes', (table) => {
      table.index('playerId', 'idx_battle_passes_playerId');
      table.index('level', 'idx_battle_passes_level');
      table.index('experience', 'idx_battle_passes_experience');
    }),
    
    // Battle pass rewards table indexes
    knex.schema.alterTable('battle_pass_rewards', (table) => {
      table.index('level', 'idx_battle_pass_rewards_level');
      table.index('createdAt', 'idx_battle_pass_rewards_createdAt');
    }),
    
    // Player rewards table indexes
    knex.schema.alterTable('player_rewards', (table) => {
      table.index('playerId', 'idx_player_rewards_playerId');
      table.index('rewardId', 'idx_player_rewards_rewardId');
      table.index('claimed', 'idx_player_rewards_claimed');
      table.index('awarded_at', 'idx_player_rewards_awarded_at');
      table.index(['playerId', 'rewardId'], 'idx_player_rewards_player_reward');
    })
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return Promise.all([
    // Drop players table indexes
    knex.schema.alterTable('players', (table) => {
      table.dropIndex('playerId', 'idx_players_playerId');
      table.dropIndex('nickname', 'idx_players_nickname');
      table.dropIndex('createdAt', 'idx_players_createdAt');
    }),
    
    // Drop battle passes table indexes
    knex.schema.alterTable('battle_passes', (table) => {
      table.dropIndex('playerId', 'idx_battle_passes_playerId');
      table.dropIndex('level', 'idx_battle_passes_level');
      table.dropIndex('experience', 'idx_battle_passes_experience');
    }),
    
    // Drop battle pass rewards table indexes
    knex.schema.alterTable('battle_pass_rewards', (table) => {
      table.dropIndex('level', 'idx_battle_pass_rewards_level');
      table.dropIndex('createdAt', 'idx_battle_pass_rewards_createdAt');
    }),
    
    // Drop player rewards table indexes
    knex.schema.alterTable('player_rewards', (table) => {
      table.dropIndex('playerId', 'idx_player_rewards_playerId');
      table.dropIndex('rewardId', 'idx_player_rewards_rewardId');
      table.dropIndex('claimed', 'idx_player_rewards_claimed');
      table.dropIndex('awarded_at', 'idx_player_rewards_awarded_at');
      table.dropIndex(['playerId', 'rewardId'], 'idx_player_rewards_player_reward');
    })
  ]);
};
