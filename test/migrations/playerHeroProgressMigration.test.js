const { expect } = require('chai');

function createTableMock() {
  const columns = [];
  const constraints = [];
  const indexes = [];
  let currentColumn = null;

  const chain = {
    primary() {
      constraints.push({ column: currentColumn, type: 'primary' });
      return chain;
    },
    notNullable() {
      constraints.push({ column: currentColumn, type: 'notNullable' });
      return chain;
    },
    unique() {
      constraints.push({ column: currentColumn, type: 'unique' });
      return chain;
    },
    unsigned() {
      constraints.push({ column: currentColumn, type: 'unsigned' });
      return chain;
    },
    references(reference) {
      constraints.push({ column: currentColumn, type: 'references', reference });
      return chain;
    },
    inTable(table) {
      constraints.push({ column: currentColumn, type: 'inTable', table });
      return chain;
    },
    onDelete(action) {
      constraints.push({ column: currentColumn, type: 'onDelete', action });
      return chain;
    },
    defaultTo(value) {
      constraints.push({ column: currentColumn, type: 'defaultTo', value });
      return chain;
    }
  };

  const table = {
    increments(name) {
      currentColumn = name;
      columns.push({ type: 'increments', name });
      return chain;
    },
    string(name) {
      currentColumn = name;
      columns.push({ type: 'string', name });
      return chain;
    },
    integer(name) {
      currentColumn = name;
      columns.push({ type: 'integer', name });
      return chain;
    },
    unique(columnsList, name) {
      constraints.push({
        column: Array.isArray(columnsList) ? columnsList.join(',') : columnsList,
        type: 'unique',
        name
      });
      return chain;
    },
    index(columnsList, name) {
      indexes.push({
        columns: Array.isArray(columnsList) ? columnsList : [columnsList],
        name
      });
      return chain;
    },
    timestamps() {
      columns.push({ type: 'timestamps' });
      return chain;
    }
  };

  return { table, columns, constraints, indexes };
}

function createKnexMock() {
  const calls = [];

  const schema = {
    createTable(name, callback) {
      const { table, columns, constraints, indexes } = createTableMock();
      callback(table);
      calls.push({ type: 'createTable', name, columns, constraints, indexes });
      return Promise.resolve();
    },
    dropTable(name) {
      calls.push({ type: 'dropTable', name });
      return Promise.resolve();
    }
  };

  return {
    fn: {
      now: () => 'NOW'
    },
    schema,
    calls
  };
}

describe('Player hero progress migration (Phase 1: 1.1-1.3)', () => {
  it('creates player_hero_progress with FKs, unique pair, level defaults, and indexes', async () => {
    const migration = require('../../migrations/20260419000100_create_player_hero_progress_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('player_hero_progress');

    expect(createCall.columns.some((c) => c.type === 'string' && c.name === 'playerId')).to.equal(true);
    expect(createCall.columns.some((c) => c.type === 'string' && c.name === 'heroId')).to.equal(true);
    expect(createCall.columns.some((c) => c.type === 'integer' && c.name === 'level')).to.equal(true);
    expect(createCall.columns.some((c) => c.type === 'timestamps')).to.equal(true);

    expect(createCall.constraints.some((c) => c.column === 'playerId' && c.type === 'references' && c.reference === 'playerId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'playerId' && c.type === 'inTable' && c.table === 'players')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'references' && c.reference === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'inTable' && c.table === 'heroes')).to.equal(true);

    expect(createCall.constraints.some((c) => c.column === 'level' && c.type === 'unsigned')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'level' && c.type === 'defaultTo' && c.value === 0)).to.equal(true);

    expect(createCall.constraints.some((c) => c.type === 'unique' && c.column === 'playerId,heroId' && c.name === 'uq_player_hero_progress')).to.equal(true);

    expect(createCall.indexes.some((i) => i.name === 'idx_player_hero_progress_playerId' && i.columns.includes('playerId'))).to.equal(true);
    expect(createCall.indexes.some((i) => i.name === 'idx_player_hero_progress_heroId' && i.columns.includes('heroId'))).to.equal(true);
  });

  it('supports rollback by dropping player_hero_progress', async () => {
    const migration = require('../../migrations/20260419000100_create_player_hero_progress_table');
    const knex = createKnexMock();

    await migration.down(knex);

    expect(knex.calls.some((c) => c.type === 'dropTable' && c.name === 'player_hero_progress')).to.equal(true);
  });
});