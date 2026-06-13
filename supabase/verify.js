const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env');
const url = fs.readFileSync(envPath, 'utf8').match(/SUPABASE_DB_URL=(.+)/)[1].trim();

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const { rows } = await c.query(`
    SELECT
      (SELECT count(*)::int FROM public.circles) AS circles,
      (SELECT count(*)::int FROM public.checklist_items) AS checklist_items,
      (SELECT count(*)::int FROM auth.users) AS auth_users,
      (SELECT count(*)::int FROM public.profiles) AS profiles
  `);
  console.log('Database state:', rows[0]);
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
