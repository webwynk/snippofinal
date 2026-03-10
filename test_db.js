import 'dotenv/config';
import { pool } from './server/src/store.js';

async function test() {
  const us = await pool.query("SELECT id, name, email, role, status FROM users WHERE role='staff'");
  console.log("Staff users in DB:", us.rows);
  const st = await pool.query("SELECT id, name, email, active FROM staff");
  console.log("Staff profiles in DB:", st.rows);
  process.exit(0);
}
test();
