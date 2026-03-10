import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    const res = await pool.query(`SELECT * FROM settings`);
    console.log("Current settings table content:");
    console.dir(res.rows, { depth: null });
  } catch (err) {
    console.error("Error querying settings table:");
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
