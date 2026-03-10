import 'dotenv/config';
import { pool } from './src/store.js';

async function check() {
  try {
    const users = await pool.query("SELECT id, name, email, role, status, staff_id FROM users WHERE role='staff'");
    console.log("Users table:", users.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
