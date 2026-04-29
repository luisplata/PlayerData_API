const http = require('http');
const url = require('url');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const db = require('../DB/db');

const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:8080';
const HEALTH_PATH = process.env.TEST_HEALTH_PATH || '/health';
const RETRIES = parseInt(process.env.TEST_VERIFY_RETRIES || '30', 10);
const INTERVAL_MS = parseInt(process.env.TEST_VERIFY_INTERVAL_MS || '1000', 10);

function checkServerOnce() {
  return new Promise((resolve, reject) => {
    const u = new url.URL(TEST_SERVER_URL + HEALTH_PATH);
    const opts = { method: 'GET', hostname: u.hostname, port: u.port, path: u.pathname };
    const req = http.request(opts, res => {
      const status = res.statusCode;
      if (status >= 200 && status < 300) return resolve(true);
      return reject(new Error(`health responded ${status}`));
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function checkDbOnce() {
  try {
    // simple raw query
    await db.raw('SELECT 1 as ok');
    return true;
  } catch (e) {
    throw e;
  }
}

async function retry(fn, name) {
  for (let i = 0; i < RETRIES; i++) {
    try {
      await fn();
      console.log(`${name} OK`);
      return;
    } catch (e) {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, INTERVAL_MS));
    }
  }
  throw new Error(`${name} did not become ready after ${RETRIES} attempts`);
}

(async () => {
  try {
    console.log(`Verifying server at ${TEST_SERVER_URL}${HEALTH_PATH}`);
    await retry(checkServerOnce, 'server');
    console.log('\nVerifying DB connection');
    await retry(checkDbOnce, 'database');
    console.log('\nAll checks passed');
    process.exit(0);
  } catch (e) {
    console.error('\nCheck failed:', e.message || e);
    process.exit(2);
  }
})();
