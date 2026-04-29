const { spawnSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed with code ${res.status}`);
  }
}

async function main() {
  try {
    // 1) docker-compose up
    run('docker-compose', ['up', '--build', '-d']);

    // 2) wait for server+db health using existing verify script
    run('node', ['scripts/test-verify.js']);

    // 3) run migrations and seeds
    run('npm', ['run', 'migrate']);
    run('npm', ['run', 'seed']);

    // 4) run integration tests
    run('npm', ['run', 'test:integration']);
  } catch (e) {
    console.error('Error during integration flow:', e.message || e);
    console.log('Tearing down docker-compose...');
    try {
      run('docker-compose', ['down', '--remove-orphans']);
    } catch (e2) {
      console.error('Failed to tear down docker-compose:', e2.message || e2);
    }
    process.exit(1);
  }

  // Successful run: bring down containers
  console.log('Integration tests finished — tearing down docker-compose');
  run('docker-compose', ['down', '--remove-orphans']);
}

main();
