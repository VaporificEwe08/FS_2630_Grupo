const { Pool } = require('pg');

let pool;
let schemaReady;

function database() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  if (!pool) pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 10000 });
  return pool;
}

async function ready() {
  if (!schemaReady) {
    schemaReady = database().query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
      CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY);
      WITH applied AS (
        INSERT INTO schema_migrations (id) VALUES ('promote_initial_admins_2026_11')
        ON CONFLICT DO NOTHING RETURNING id
      )
      UPDATE users SET is_admin = TRUE
      WHERE lower(email) IN ('neycarlos@javeriana.edu.co', 'jimenezb_p@javeriana.edu.co')
        AND EXISTS (SELECT 1 FROM applied);
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash CHAR(64) PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reports (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id),
        type VARCHAR(40) NOT NULL CHECK (type IN ('BASURA_NO_RECOGIDA', 'CONTENEDOR_LLENO', 'ESCOMBROS', 'OTRO')),
        location VARCHAR(100) NOT NULL,
        description VARCHAR(300) NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        status VARCHAR(20) NOT NULL DEFAULT 'RECIBIDO' CHECK (status IN ('RECIBIDO', 'EN_GESTION', 'RESUELTO')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
      CREATE TABLE IF NOT EXISTS report_status_events (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        report_id BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('RECIBIDO', 'EN_GESTION', 'RESUELTO')),
        actor_user_id BIGINT NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS report_status_events_report_idx ON report_status_events (report_id, id);
    `).catch((error) => { schemaReady = null; throw error; });
  }
  await schemaReady;
  return database();
}

module.exports = { database, ready };
