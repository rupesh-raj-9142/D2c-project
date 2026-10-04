import pg from 'pg';

async function fix() {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  });

  await client.connect();
  console.log('Connected to postgres.');
  await client.query('DROP DATABASE IF EXISTS laxmi_db');
  await client.query("CREATE DATABASE laxmi_db WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0");
  console.log('✅ laxmi_db recreated with UTF8 encoding!');
  await client.end();
}

fix().catch(console.error);
