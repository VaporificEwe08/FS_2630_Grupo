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
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
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
    `).catch((error) => { schemaReady = null; throw error; });
  }
  await schemaReady;
  return database();
}

module.exports = { database, ready };
