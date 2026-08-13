const { Client } = require('pg');

async function run() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: conn });
  await client.connect();

  try {
    const tables = ['User', 'Member', 'Ledger', 'Payment'];
    for (const t of tables) {
      try {
        const r = await client.query(`SELECT count(*)::int as c FROM "${t}"`);
        console.log(`${t} count:`, r.rows[0].c);
      } catch (e) {
        console.log(`${t} count: (table missing or error)`, e.message || e);
      }
    }

    const users = await client.query('SELECT id, email, role FROM "User" ORDER BY id LIMIT 5');
    console.log('User sample rows:', users.rows);

    const members = await client.query('SELECT id, "fullName", "createdAt" FROM "Member" ORDER BY "createdAt" DESC LIMIT 5');
    console.log('Member sample rows:', members.rows);

    const ledgers = await client.query('SELECT id, "memberId", date FROM "Ledger" ORDER BY date DESC LIMIT 5');
    console.log('Ledger sample rows:', ledgers.rows);

    const payments = await client.query('SELECT id, "ledgerId", date FROM "Payment" ORDER BY date DESC LIMIT 5');
    console.log('Payment sample rows:', payments.rows);

  } finally {
    await client.end();
  }
}

run().catch(err=>{console.error('Error:', err); process.exit(1)});
