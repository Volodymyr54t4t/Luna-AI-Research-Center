require('dotenv').config();
const { Pool } = require('pg');

// Підключення до бази даних PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ініціалізація всіх таблиць
async function initializeDatabase() {
  try {
    // Таблиця для енергетичних експериментів (сонячні панелі)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS energy_experiments (
        id SERIAL PRIMARY KEY,
        angle FLOAT NOT NULL,
        sunlight FLOAT NOT NULL,
        temperature FLOAT NOT NULL,
        dust FLOAT NOT NULL,
        efficiency FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблиця energy_experiments готова');

    // Таблиця для радіаційних експериментів
    await pool.query(`
      CREATE TABLE IF NOT EXISTS radiation_experiments (
        id SERIAL PRIMARY KEY,
        material TEXT NOT NULL,
        thickness FLOAT NOT NULL,
        radiation_level FLOAT NOT NULL,
        penetration FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблиця radiation_experiments готова');

    // Таблиця для термо експериментів (теплопередача)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS thermo_experiments (
        id SERIAL PRIMARY KEY,
        material TEXT NOT NULL,
        thickness FLOAT NOT NULL,
        area FLOAT NOT NULL,
        inside_temp FLOAT NOT NULL,
        outside_temp FLOAT NOT NULL,
        coefficient FLOAT NOT NULL,
        heat_loss FLOAT NOT NULL,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблиця thermo_experiments готова');

    console.log('🌕 Усі таблиці ініціалізовано успішно!');
  } catch (err) {
    console.error('❌ Помилка ініціалізації БД:', err.message);
  }
}

// Виклик ініціалізації при запуску
initializeDatabase();

module.exports = pool;
