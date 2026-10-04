import { ensureDatabase } from '../config/db-server.js';

async function run() {
  await ensureDatabase();
  console.log('PostgreSQL is ready.');
}

run().catch((err) => {
  console.error('Failed to start database:', err);
  process.exit(1);
});
