const fs = require('fs');
const path = require('path');

const db = require('../../DB/db');
const Hero = require('../../src/entities/Hero');

function parseArgs(argv) {
  const args = {};

  argv.forEach(entry => {
    if (!entry.startsWith('--')) {
      return;
    }

    const [key, value] = entry.slice(2).split('=');
    args[key] = value;
  });

  return args;
}

function parseMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      return {};
    }
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  return {};
}

function requireHeroId(payload) {
  if (
    !payload ||
    typeof payload.heroId !== 'string' ||
    payload.heroId.trim() === ''
  ) {
    throw new Error('heroId is required in input file');
  }

  return payload.heroId.trim();
}

function loadPayload(inputPath) {
  if (!inputPath) {
    throw new Error('input file is required for this action');
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const payload = JSON.parse(raw);

  return {
    absolutePath,
    payload
  };
}

async function createHero(payload) {
  const heroId = requireHeroId(payload);
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const metadata = payload.metadata;

  const hero = new Hero(heroId, name, metadata);
  hero.validate();

  const existing = await db('heroes').where({ heroId }).first();
  if (existing) {
    throw new Error(`hero '${heroId}' already exists`);
  }

  const now = new Date();
  await db('heroes').insert({
    heroId,
    name,
    metadata: JSON.stringify(metadata),
    created_at: now,
    updated_at: now
  });

  return db('heroes').where({ heroId }).first();
}

async function listHeroes() {
  return db('heroes').orderBy('name', 'asc');
}

async function getHero(payload) {
  const heroId = requireHeroId(payload);
  const hero = await db('heroes').where({ heroId }).first();

  if (!hero) {
    throw new Error(`hero '${heroId}' was not found`);
  }

  return hero;
}

async function updateHero(payload) {
  const heroId = requireHeroId(payload);
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const metadata = payload.metadata;

  const hero = new Hero(heroId, name, metadata);
  hero.validate();

  const existing = await db('heroes').where({ heroId }).first();
  if (!existing) {
    throw new Error(`hero '${heroId}' was not found`);
  }

  await db('heroes')
    .where({ heroId })
    .update({
      name,
      metadata: JSON.stringify(metadata),
      updated_at: new Date()
    });

  return db('heroes').where({ heroId }).first();
}

async function deleteHero(payload) {
  const heroId = requireHeroId(payload);
  const deletedRows = await db('heroes').where({ heroId }).del();

  if (deletedRows === 0) {
    throw new Error(`hero '${heroId}' was not found`);
  }

  return {
    heroId,
    deleted: true,
    deletedRows
  };
}

function serializeHero(hero) {
  return {
    ...hero,
    metadata: parseMetadata(hero.metadata)
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const action =
    typeof args.action === 'string' ? args.action.trim().toLowerCase() : '';

  if (!action) {
    throw new Error(
      'action is required. Use --action=create|list|get|update|delete'
    );
  }

  let inputInfo = null;
  if (['create', 'get', 'update', 'delete'].includes(action)) {
    inputInfo = loadPayload(args.input);
  }

  let result;

  if (action === 'create') {
    result = serializeHero(await createHero(inputInfo.payload));
  } else if (action === 'list') {
    const heroes = await listHeroes();
    result = {
      count: heroes.length,
      heroes: heroes.map(serializeHero)
    };
  } else if (action === 'get') {
    result = serializeHero(await getHero(inputInfo.payload));
  } else if (action === 'update') {
    result = serializeHero(await updateHero(inputInfo.payload));
  } else if (action === 'delete') {
    result = await deleteHero(inputInfo.payload);
  } else {
    throw new Error(`unsupported action '${action}'`);
  }

  const response = {
    success: true,
    action,
    input: inputInfo
      ? path.relative(process.cwd(), inputInfo.absolutePath)
      : null,
    result
  };

  console.log(JSON.stringify(response, null, 2));
}

run()
  .catch(error => {
    const response = {
      success: false,
      error: error.message
    };

    console.error(JSON.stringify(response, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
