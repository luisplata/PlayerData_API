const { expect } = require('chai');

function createTableMock() {
  const columns = [];
  const constraints = [];
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
    text(name) {
      currentColumn = name;
      columns.push({ type: 'text', name });
      return chain;
    },
    integer(name) {
      currentColumn = name;
      columns.push({ type: 'integer', name });
      return chain;
    },
    json(name) {
      currentColumn = name;
      columns.push({ type: 'json', name });
      return chain;
    },
    timestamp(name) {
      currentColumn = name;
      columns.push({ type: 'timestamp', name });
      return chain;
    },
    unique(columnsList, name) {
      constraints.push({ column: Array.isArray(columnsList) ? columnsList.join(',') : columnsList, type: 'unique', name });
      return chain;
    },
    timestamps() {
      columns.push({ type: 'timestamps' });
      return chain;
    }
  };

  return { table, columns, constraints };
}

function createKnexMock() {
  const calls = [];

  const indexChain = {
    index(name) {
      calls.push({ type: 'index', name });
      return indexChain;
    },
    dropIndex(name) {
      calls.push({ type: 'dropIndex', name });
      return indexChain;
    }
  };

  const schema = {
    createTable(name, callback) {
      const { table, columns, constraints } = createTableMock();
      callback(table);
      calls.push({ type: 'createTable', name, columns, constraints });
      return Promise.resolve();
    },
    dropTable(name) {
      calls.push({ type: 'dropTable', name });
      return Promise.resolve();
    },
    alterTable(name, callback) {
      calls.push({ type: 'alterTable', name });
      callback(indexChain);
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

describe('Heroes foundation migrations (Phase 1: 1.1-1.3)', () => {
  it('1.1 should create heroes table with heroId unique, metadata and timestamps', async () => {
    const migration = require('../../migrations/20260417000100_create_heroes_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('heroes');

    expect(createCall.columns.some((c) => c.name === 'heroId')).to.equal(true);
    expect(createCall.columns.some((c) => c.name === 'metadata' && c.type === 'json')).to.equal(true);
    expect(createCall.columns.some((c) => c.type === 'timestamps')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'unique')).to.equal(true);
  });

  it('1.2 should create passives table with FK to heroes(heroId) and metadata', async () => {
    const migration = require('../../migrations/20260417000101_create_passives_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('passives');

    expect(createCall.columns.some((c) => c.name === 'heroId')).to.equal(true);
    expect(createCall.columns.some((c) => c.name === 'metadata' && c.type === 'json')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'references' && c.reference === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'inTable' && c.table === 'heroes')).to.equal(true);
  });

  it('1.3 should create dialogs table with FK to heroes(heroId)', async () => {
    const migration = require('../../migrations/20260417000102_create_dialogs_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('dialogs');

    expect(createCall.columns.some((c) => c.name === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'references' && c.reference === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'inTable' && c.table === 'heroes')).to.equal(true);
    expect(createCall.columns.some((c) => c.type === 'timestamps')).to.equal(true);
  });

  it('1.4 should create dialog_questions table with FK to dialogs(id) and correct_answer', async () => {
    const migration = require('../../migrations/20260417000103_create_dialog_questions_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('dialog_questions');

    expect(createCall.columns.some((c) => c.name === 'dialogId')).to.equal(true);
    expect(createCall.columns.some((c) => c.name === 'correct_answer' && c.type === 'string')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'dialogId' && c.type === 'references' && c.reference === 'id')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'dialogId' && c.type === 'inTable' && c.table === 'dialogs')).to.equal(true);
  });

  it('1.5 should create player_passives table with unique player/hero/passive relation', async () => {
    const migration = require('../../migrations/20260417000104_create_player_passives_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('player_passives');

    expect(createCall.columns.some((c) => c.name === 'playerId')).to.equal(true);
    expect(createCall.columns.some((c) => c.name === 'heroId')).to.equal(true);
    expect(createCall.columns.some((c) => c.name === 'passiveId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'playerId' && c.type === 'references' && c.reference === 'playerId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'references' && c.reference === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'passiveId' && c.type === 'references' && c.reference === 'passiveId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.type === 'unique')).to.equal(true);
  });

  it('1.6 should create heroes indexes migration with safe index definitions', async () => {
    const migration = require('../../migrations/20260417000105_add_heroes_indexes_safe');
    const knex = createKnexMock();

    await migration.up(knex);

    expect(knex.calls.some((c) => c.type === 'alterTable' && c.name === 'heroes')).to.equal(true);
    expect(knex.calls.some((c) => c.type === 'alterTable' && c.name === 'passives')).to.equal(true);
    expect(knex.calls.some((c) => c.type === 'alterTable' && c.name === 'dialogs')).to.equal(true);
    expect(knex.calls.some((c) => c.type === 'alterTable' && c.name === 'dialog_questions')).to.equal(true);
    expect(knex.calls.some((c) => c.type === 'alterTable' && c.name === 'player_passives')).to.equal(true);
    expect(knex.calls.some((c) => c.type === 'index')).to.equal(true);
  });
});
