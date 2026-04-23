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
      constraints.push({
        column: currentColumn,
        type: 'references',
        reference
      });
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
    },
    dropColumn(name) {
      columns.push({ type: 'dropColumn', name });
      return chain;
    }
  };

  const table = {
    integer(name) {
      currentColumn = name;
      columns.push({ type: 'integer', name });
      return chain;
    },
    dropColumn(name) {
      columns.push({ type: 'dropColumn', name });
      return chain;
    }
  };

  return { table, columns, constraints, indexes };
}

function createKnexMock() {
  const calls = [];
  const schema = {
    alterTable(name, callback) {
      const { table, columns, constraints, indexes } = createTableMock();
      callback(table);
      calls.push({ type: 'alterTable', name, columns, constraints, indexes });
      return Promise.resolve();
    }
  };

  return { schema, calls };
}

describe('player_hero_progress currentXp migration', () => {
  it('adds currentXp with default zero', async () => {
    const migration = require('../../migrations/20260420000104_add_current_xp_to_player_hero_progress');
    const knex = createKnexMock();

    await migration.up(knex);

    const alterCall = knex.calls.find(call => call.type === 'alterTable');
    expect(alterCall).to.exist;
    expect(alterCall.name).to.equal('player_hero_progress');
    expect(
      alterCall.columns.some(
        column => column.type === 'integer' && column.name === 'currentXp'
      )
    ).to.equal(true);
    expect(
      alterCall.constraints.some(
        constraint =>
          constraint.column === 'currentXp' && constraint.type === 'unsigned'
      )
    ).to.equal(true);
    expect(
      alterCall.constraints.some(
        constraint =>
          constraint.column === 'currentXp' && constraint.type === 'notNullable'
      )
    ).to.equal(true);
    expect(
      alterCall.constraints.some(
        constraint =>
          constraint.column === 'currentXp' &&
          constraint.type === 'defaultTo' &&
          constraint.value === 0
      )
    ).to.equal(true);
  });

  it('removes currentXp on rollback', async () => {
    const migration = require('../../migrations/20260420000104_add_current_xp_to_player_hero_progress');
    const knex = createKnexMock();

    await migration.down(knex);

    const alterCall = knex.calls.find(call => call.type === 'alterTable');
    expect(alterCall).to.exist;
    expect(
      alterCall.columns.some(
        column => column.type === 'dropColumn' && column.name === 'currentXp'
      )
    ).to.equal(true);
  });
});
