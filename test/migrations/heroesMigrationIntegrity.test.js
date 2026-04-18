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
      constraints.push({
        column: Array.isArray(columnsList) ? columnsList.join(',') : columnsList,
        type: 'unique',
        name
      });
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

describe('Heroes migration integrity (Phase 5.2)', () => {
  it('enforces FK and unique constraints for player_passives', async () => {
    const migration = require('../../migrations/20260417000104_create_player_passives_table');
    const knex = createKnexMock();

    await migration.up(knex);

    const createCall = knex.calls.find((c) => c.type === 'createTable');
    expect(createCall).to.exist;
    expect(createCall.name).to.equal('player_passives');

    expect(createCall.constraints.some((c) => c.column === 'playerId' && c.type === 'references' && c.reference === 'playerId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'heroId' && c.type === 'references' && c.reference === 'heroId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.column === 'passiveId' && c.type === 'references' && c.reference === 'passiveId')).to.equal(true);
    expect(createCall.constraints.some((c) => c.type === 'unique' && c.column === 'playerId,heroId,passiveId')).to.equal(true);
  });

  it('supports rollback paths for heroes schema tables (down drops created tables)', async () => {
    const migrationFiles = [
      { file: '../../migrations/20260417000100_create_heroes_table', table: 'heroes' },
      { file: '../../migrations/20260417000101_create_passives_table', table: 'passives' },
      { file: '../../migrations/20260417000102_create_dialogs_table', table: 'dialogs' },
      { file: '../../migrations/20260417000103_create_dialog_questions_table', table: 'dialog_questions' },
      { file: '../../migrations/20260417000104_create_player_passives_table', table: 'player_passives' }
    ];

    for (const item of migrationFiles) {
      const migration = require(item.file);
      const knex = createKnexMock();

      await migration.down(knex);

      expect(knex.calls.some((c) => c.type === 'dropTable' && c.name === item.table)).to.equal(true);
    }
  });

  it('keeps safe index rollback as no-op to avoid FK-backed drop errors', async () => {
    const safeMigrations = [
      require('../../migrations/20260417000105_add_heroes_indexes_safe'),
      require('../../migrations/20241201000001_add_database_indexes_safe')
    ];

    for (const migration of safeMigrations) {
      const knex = createKnexMock();

      await migration.down(knex);

      expect(knex.calls.some((c) => c.type === 'dropIndex')).to.equal(false);
    }
  });
});
