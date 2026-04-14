require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== ЕНЕРГЕТИЧНИЙ МОДУЛЬ (LunaEnergy AI) ====================

// POST /api/energy/calculate - Розрахунок ефективності сонячних панелей
app.post('/api/energy/calculate', async (req, res) => {
  const { angle, sunlight, temperature, dust } = req.body;
  
  try {
    // Валідація
    if (angle === undefined || angle < 0 || angle > 90) {
      return res.status(400).json({ error: 'Невірний кут (0-90°)' });
    }
    if (sunlight === undefined || sunlight < 0 || sunlight > 1) {
      return res.status(400).json({ error: 'Невірна інтенсивність (0-1)' });
    }
    if (dust === undefined || dust < 0 || dust > 1) {
      return res.status(400).json({ error: 'Невірний пиловий фактор (0-1)' });
    }

    // Розрахунок ефективності
    const efficiency = Math.cos((angle * Math.PI) / 180) * sunlight * (1 - dust);

    // Збереження в БД
    const result = await pool.query(
      'INSERT INTO energy_experiments (angle, sunlight, temperature, dust, efficiency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [angle, sunlight, temperature, dust, efficiency]
    );

    res.json({
      success: true,
      efficiency: efficiency * 100,
      experiment: result.rows[0]
    });
  } catch (err) {
    console.error('Помилка енергетичного модуля:', err);
    res.status(500).json({ error: 'Помилка обробки запиту' });
  }
});

// GET /api/energy/experiments - Отримання всіх енергетичних експериментів
app.get('/api/energy/experiments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM energy_experiments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

// GET /api/energy/stats - Статистика енергетичних експериментів
app.get('/api/energy/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*)::text AS total,
        COALESCE(ROUND((AVG(efficiency) * 100)::numeric, 2), 0) AS avg_efficiency,
        COALESCE(ROUND((MIN(efficiency) * 100)::numeric, 2), 0) AS min_efficiency,
        COALESCE(ROUND((MAX(efficiency) * 100)::numeric, 2), 0) AS max_efficiency,
        COALESCE(ROUND(AVG(angle)::numeric, 1), 0) AS avg_angle,
        COALESCE(ROUND(AVG(temperature)::numeric, 1), 0) AS avg_temperature
      FROM energy_experiments
    `);

    res.json(result.rows[0] || {
      total: '0',
      avg_efficiency: '0.00',
      min_efficiency: '0.00',
      max_efficiency: '0.00',
      avg_angle: '0.0',
      avg_temperature: '0.0'
    });
  } catch (err) {
    console.error('Помилка обробки статистики:', err);
    res.status(500).json({ error: 'Помилка обробки запиту' });
  }
});

// POST /api/energy/clear - Очистити енергетичні експерименти
app.post('/api/energy/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM energy_experiments');
    res.json({ success: true, message: 'Усі енергетичні експерименти видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка очищення' });
  }
});

// ==================== РАДІАЦІЙНИЙ МОДУЛЬ (LunaRadiation AI) ====================

// Коефіцієнти для матеріалів
const radiationCoefficients = {
  'Алюміній': 0.6,
  'Вода': 0.3,
  'Реголіт': 0.1
};

// POST /api/radiation/calculate - Розрахунок радіаційного захисту
app.post('/api/radiation/calculate', async (req, res) => {
  try {
    const { material, thickness, radiationLevel } = req.body;

    // Валідація
    const k = radiationCoefficients[material];
    if (!k) {
      return res.status(400).json({ error: 'Невідомий матеріал' });
    }

    // Розрахунок проникнення радіації
    const penetration = radiationLevel * Math.exp(-k * thickness);

    // Збереження в БД
    const result = await pool.query(
      'INSERT INTO radiation_experiments (material, thickness, radiation_level, penetration) VALUES ($1, $2, $3, $4) RETURNING *',
      [material, thickness, radiationLevel, penetration]
    );

    res.json({
      success: true,
      ...result.rows[0],
      penetration: Number(penetration.toFixed(2))
    });
  } catch (err) {
    console.error('Помилка радіаційного модуля:', err);
    res.status(500).json({ error: 'Помилка обробки запиту' });
  }
});

// GET /api/radiation/experiments - Отримання радіаційних експериментів
app.get('/api/radiation/experiments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM radiation_experiments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Помилка отримання даних' });
  }
});

// POST /api/radiation/clear - Очистити радіаційні експерименти
app.post('/api/radiation/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM radiation_experiments');
    res.json({ success: true, message: 'Усі радіаційні експерименти видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка очищення' });
  }
});

// ==================== ТЕРМОРЕГУЛЯЦІЙНИЙ МОДУЛЬ (LunaThermo AI) ====================

// Коефіцієнти теплопровідності матеріалів
const materialCoefficients = {
  aluminum: 205,
  plastic: 0.2,
  glass: 0.8,
  insulation: 0.04
};

// Функція для розрахунку рекомендацій
function getRecommendation(heatLoss) {
  if (heatLoss > 1000) {
    return 'Високі втрати тепла, рекомендується покращена ізоляція';
  } else if (heatLoss >= 300 && heatLoss <= 1000) {
    return 'Середні втрати тепла, варто покращити ізоляцію';
  } else {
    return 'Матеріал достатньо ефективний';
  }
}

// POST /api/thermo/calculate - Розрахунок теплопередачі
app.post('/api/thermo/calculate', async (req, res) => {
  try {
    const { material, thickness, area, insideTemp, outsideTemp } = req.body;

    // Валідація
    const errors = [];
    if (!material || !materialCoefficients[material]) {
      errors.push('Невалідний матеріал');
    }
    if (!thickness || thickness <= 0) {
      errors.push('Товщина мусить бути більше 0');
    }
    if (!area || area <= 0) {
      errors.push('Площа мусить бути більше 0');
    }
    if (insideTemp === undefined || insideTemp === null) {
      errors.push('Вкажіть внутрішню температуру');
    }
    if (outsideTemp === undefined || outsideTemp === null) {
      errors.push('Вкажіть зовнішню температуру');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Отримання коефіцієнту
    const coefficient = materialCoefficients[material];

    // Розрахунок за формулою: Q = k * area * ((insideTemp - outsideTemp) / thickness)
    const tempDifference = insideTemp - outsideTemp;
    const heatLoss = coefficient * area * (tempDifference / thickness);

    // Отримання рекомендації
    const recommendation = getRecommendation(heatLoss);

    // Збереження в БД
    const result = await pool.query(
      `INSERT INTO thermo_experiments (material, thickness, area, inside_temp, outside_temp, coefficient, heat_loss, recommendation) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [material, thickness, area, insideTemp, outsideTemp, coefficient, heatLoss, recommendation]
    );

    res.json({
      success: true,
      result: {
        material,
        thickness: parseFloat(thickness),
        area: parseFloat(area),
        insideTemp: parseFloat(insideTemp),
        outsideTemp: parseFloat(outsideTemp),
        coefficient,
        heatLoss: parseFloat(heatLoss.toFixed(2)),
        recommendation,
        createdAt: new Date().toLocaleString('uk-UA')
      }
    });
  } catch (error) {
    console.error('Помилка термо модуля:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при розрахунку. Спробуйте пізніше.'
    });
  }
});

// GET /api/thermo/experiments - Отримання термо експериментів
app.get('/api/thermo/experiments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM thermo_experiments ORDER BY created_at DESC'
    );

    const formattedExperiments = result.rows.map(exp => ({
      ...exp,
      created_at: new Date(exp.created_at).toLocaleString('uk-UA')
    }));

    res.json({
      success: true,
      data: formattedExperiments
    });
  } catch (error) {
    console.error('Помилка при отриманні експериментів:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні даних'
    });
  }
});

// POST /api/thermo/clear - Очистити термо експерименти
app.post('/api/thermo/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM thermo_experiments');
    res.json({ success: true, message: 'Усі термо експерименти видалено' });
  } catch (err) {
    res.status(500).json({ error: 'Помилка очищення' });
  }
});

// ==================== ОСНОВНІ МАРШРУТИ ====================

// GET / - Головна сторінка
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /api/modules - Список усіх модулів
app.get('/api/modules', (req, res) => {
  res.json({
    modules: [
      {
        id: 'energy',
        name: 'LunaEnergy AI',
        description: 'Ефективність сонячних панелей на Місяці',
        icon: '☀️',
        url: '/energy'
      },
      {
        id: 'radiation',
        name: 'LunaRadiation AI',
        description: 'Моделювання захисту від космічної радіації',
        icon: '☢️',
        url: '/radiation'
      },
      {
        id: 'thermo',
        name: 'LunaThermo AI',
        description: 'Моделювання теплопередачі на Місяці',
        icon: '🌡️',
        url: '/thermo'
      }
    ]
  });
});

// Обробка помилок 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
  🌕 ╔════════════════════════════════════════════════╗
  🌕 ║     LUNA AI RESEARCH CENTER UNIFIED 🌕          ║
  🌕 ║        Обєднана система досліджень Місяця       ║
  🌕 ╠════════════════════════════════════════════════╣
  🌕 ║  Сервер запущено на:  http://localhost:${PORT}   
  🌕 ║  
  🌕 ║  Доступні модулі:
  🌕 ║  ☀️  LunaEnergy - http://localhost:${PORT}/energy
  🌕 ║  ☢️  LunaRadiation - http://localhost:${PORT}/radiation
  🌕 ║  🌡️  LunaThermo - http://localhost:${PORT}/thermo
  🌕 ║  
  🌕 ║  API: http://localhost:${PORT}/api
  🌕 ╚════════════════════════════════════════════════╝
  `);
});
