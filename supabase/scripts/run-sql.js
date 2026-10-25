#!/usr/bin/env node
/** Run a SQL file against SUPABASE_DB_URL from .env */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node run-sql.js <path-to.sql>');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '..', '.env');
let url = fs.readFileSync(envPath, 'utf8').match(/SUPABASE_DB_URL=(.+)/)?.[1]?.trim();
if (!url) {
  console.error('SUPABASE_DB_URL not found in .env');
  process.exit(1);
}

// Encode special chars in password (e.g. !) if the URL is otherwise unparseable.
try {
  // eslint-disable-next-line no-new
  new URL(url);
} catch {
  url = url.replace(/^(postgresql:\/\/[^:]+:)([^@]+)(@.*)$/, (_, a, pass, rest) => {
    return a + encodeURIComponent(decodeURIComponent(pass)) + rest;
  });
}

const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8');

(async () => {
  const c = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await c.connect();

  // Ensure migration 009 columns exist before grant scripts that depend on them.
  await c.query(`
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expert_badge_title TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expert_circle_id TEXT
      REFERENCES public.circles(id) ON DELETE SET NULL;
  `);
  console.log('Migration 009 columns ensured (expert_badge_title, expert_circle_id).');

  const result = await c.query(sql);
  console.log('Rows updated:', result.rowCount);

  const { rows } = await c.query(`
    SELECT id, name, verified, expert_badge_title, expert_circle_id, profession, verified_category
    FROM public.profiles
    WHERE name ILIKE 'ashish2'
  `);
  console.log('Profile after update:', JSON.stringify(rows, null, 2));

  if (!rows.length) {
    console.error('No profile matched name ILIKE ashish2 — check display name.');
    process.exitCode = 2;
  } else if (!rows[0].verified || !rows[0].expert_badge_title || !rows[0].expert_circle_id) {
    console.error('Profile updated but expert fields incomplete.');
    process.exitCode = 3;
  }

  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
