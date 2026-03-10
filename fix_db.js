import 'dotenv/config';
import { pool } from './server/src/store.js';

async function fix() {
  await pool.query("UPDATE users SET status='active' WHERE role='staff' AND status='pending' AND staff_id IS NOT NULL");
  console.log("Fixed stuck staff accounts");
  process.exit(0);
}
fix();
