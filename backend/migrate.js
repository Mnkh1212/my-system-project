require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mysystemdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Migration эхэлж байна...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ users table үүслээ');

    await client.query(`
      CREATE TABLE IF NOT EXISTS systems (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        system_name VARCHAR(255) NOT NULL,
        type VARCHAR(100) DEFAULT 'Карт',
        rating INTEGER DEFAULT 0,
        description TEXT,
        related_systems TEXT[],
        developer VARCHAR(255),
        duration DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ systems table үүслээ');

    console.log('Migration амжилттай дууслаа!');
  } catch (err) {
    console.error('Migration алдаа:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
