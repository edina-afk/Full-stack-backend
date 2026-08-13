const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATION_DIR = path.join(__dirname, '..', 'prisma', 'migrations');
const files = [
  '20260804072241_init/migration.sql',
  '20260807102936_add_user_role/migration.sql',
  '20260807111328_fix_user_role/migration.sql',
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Connected to DB');

    const pre = {};
    for (const t of ['Member', 'Ledger', 'Payment', 'User']) {
      try {
        const r = await client.query(`SELECT count(*)::int as c FROM \"${t}\"`);
        pre[t] = r.rows[0].c;
      } catch (e) {
        pre[t] = null;
      }
    }
    console.log('Pre-migration counts:', pre);

    for (const f of files) {
      const p = path.join(MIGRATION_DIR, f);
      if (!fs.existsSync(p)) {
        console.warn('Migration file not found, skipping:', p);
        continue;
      }
      const sql = fs.readFileSync(p, 'utf8');
      console.log('Running migration:', f);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Migration applied:', f);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', f, err.message || err);
        // stop on error to avoid partial schema changes
        throw err;
      }
    }

    const post = {};
    for (const t of ['Member', 'Ledger', 'Payment', 'User']) {
      try {
        const r = await client.query(`SELECT count(*)::int as c FROM \"${t}\"`);
        post[t] = r.rows[0].c;
      } catch (e) {
        post[t] = null;
      }
    }
    console.log('Post-migration counts:', post);

    // quick orphan check: payments whose ledgerId missing
    try {
      const orphanPayments = await client.query(
        `SELECT p.id FROM \"Payment\" p LEFT JOIN \"Ledger\" l ON p.\"ledgerId\" = l.id WHERE l.id IS NULL LIMIT 5`
      );
      console.log('Orphan Payments sample:', orphanPayments.rows);

      const orphanLedgers = await client.query(
        `SELECT l.id FROM \"Ledger\" l LEFT JOIN \"Member\" m ON l.\"memberId\" = m.id WHERE m.id IS NULL LIMIT 5`
      );
      console.log('Orphan Ledgers sample:', orphanLedgers.rows);
    } catch (e) {
      console.warn('Orphan check failed:', e.message || e);
    }

    console.log('Migrations done');
  } finally {
    await client.end();
  }
}

run().catch((err)=>{
  console.error('Migration runner error:', err);
  process.exit(1);
});
