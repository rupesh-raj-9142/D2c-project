import net from 'net';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let embeddedInstance: any = null;

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

export async function ensureDatabase(): Promise<void> {
  const port = 5432;
  const running = await isPortOpen(port);

  if (!running) {
    console.log('⚡ Starting embedded PostgreSQL 18 server on port 5432...');
    const { default: EmbeddedPostgres } = await import('embedded-postgres');
    const dbDir = path.resolve(__dirname, '../../pgdata');

    embeddedInstance = new EmbeddedPostgres({
      port,
      databaseDir: dbDir,
      user: 'postgres',
      password: 'password',
      persistent: true
    });

    try {
      await embeddedInstance.initialise();
    } catch (err: any) {
      // If already initialized, ignore
    }

    await embeddedInstance.start();
    console.log('✅ Embedded PostgreSQL is running on port 5432');
  } else {
    console.log('✅ PostgreSQL is already running on port 5432');
  }

  // Ensure 'laxmi_db' database exists
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'laxmi_db'");
    if (res.rows.length === 0) {
      console.log('📦 Creating database "laxmi_db"...');
      await client.query("CREATE DATABASE laxmi_db WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0");
      console.log('✅ Database "laxmi_db" created successfully with UTF8 encoding');
    }
  } catch (err) {
    console.warn('Note on database check:', err instanceof Error ? err.message : err);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function stopDatabase(): Promise<void> {
  if (embeddedInstance) {
    console.log('Stopping embedded PostgreSQL...');
    await embeddedInstance.stop().catch(() => {});
  }
}
