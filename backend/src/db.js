const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
const sslEnabled = process.env.PGSSL !== "false";

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Add your Neon connection string to backend/.env.");
}

const pool = new Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      password_salt text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS quit_profiles (
      id uuid PRIMARY KEY,
      user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      quit_reason text NOT NULL,
      vapes_per_week numeric NOT NULL CHECK (vapes_per_week > 0),
      vaping_history text NOT NULL,
      cost_per_vape numeric NOT NULL CHECK (cost_per_vape > 0),
      days_per_vape numeric NOT NULL CHECK (days_per_vape > 0),
      quit_goal text NOT NULL,
      estimated_daily_vape_usage numeric NOT NULL,
      estimated_daily_spend numeric NOT NULL,
      quit_start_date timestamptz NOT NULL,
      setup_completed_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: row.created_at,
  };
}

function mapQuitProfile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    quitReason: row.quit_reason,
    vapesPerWeek: Number(row.vapes_per_week),
    vapingHistory: row.vaping_history,
    costPerVape: Number(row.cost_per_vape),
    daysPerVape: Number(row.days_per_vape),
    quitGoal: row.quit_goal,
    estimatedDailyVapeUsage: Number(row.estimated_daily_vape_usage),
    estimatedDailySpend: Number(row.estimated_daily_spend),
    quitStartDate: row.quit_start_date,
    setupCompletedAt: row.setup_completed_at,
    updatedAt: row.updated_at,
  };
}

module.exports = {
  initDatabase,
  mapQuitProfile,
  mapUser,
  query,
};
