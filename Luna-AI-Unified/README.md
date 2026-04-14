# 🌕 Luna AI Research Center - Об'єднана система

Це єдина платформа для трьох революційних дослідницьких проектів, присвячених вивченню умов Місяця.

## 📂 Структура проекту

```
Luna-AI-Unified/
├── package.json           # Залежності проекту
├── server.js             # Об'єднаний сервер Express
├── db.js                 # Конфігурація БД та ініціалізація таблиць
├── .env.example          # Приклад змінних середовища
└── public/
    ├── index.html        # Головна сторінка (дэшбоард)
    ├── energy/           # LunaEnergy AI - Ефективність сонячних панелей
    │   ├── index.html
    │   ├── script.js
    │   └── style.css
    ├── radiation/        # LunaRadiation AI - Захист від радіації
    │   ├── index.html
    │   ├── script.js
    │   └── style.css
    └── thermo/           # LunaThermo AI - Теплопередача
        ├── index.html
        ├── script.js
        └── style.css
```

## 🚀 Встановлення та запуск

### 1. Установка залежностей
```bash
npm install
```

### 2. Налаштування змінних середовища
Скопіюйте `.env.example` до `.env` та вставте вашу DATABASE_URL:
```bash
cp .env.example .env
```

Відредагуйте `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
```

### 3. Запуск сервера
```bash
npm start
```

Сервер запуститься на `http://localhost:3000`

## 🌐 Модулі платформи

### ☀️ LunaEnergy AI
**Ефективність сонячних панелей на Місяці**
- URL: `http://localhost:3000/energy`
- Розрахунок ефективності на основі:
  - Кута нахилу панелі
  - Інтенсивності світла
  - Температури
  - Пилового фактору
- API endpoints:
  - `POST /api/energy/calculate`
  - `GET /api/energy/experiments`
  - `GET /api/energy/stats`
  - `POST /api/energy/clear`

### ☢️ LunaRadiation AI
**Моделювання захисту від космічної радіації**
- URL: `http://localhost:3000/radiation`
- Розрахунок проникнення радіації через матеріали
- Дослідження безпеки щитування
- API endpoints:
  - `POST /api/radiation/calculate`
  - `GET /api/radiation/experiments`
  - `POST /api/radiation/clear`

### 🌡️ LunaThermo AI
**Моделювання теплопередачі на Місяці**
- URL: `http://localhost:3000/thermo`
- Розрахунок теплопередачі для різних матеріалів
- Аналіз енергоефективності
- API endpoints:
  - `POST /api/thermo/calculate`
  - `GET /api/thermo/experiments`
  - `POST /api/thermo/clear`

## 🗄️ База даних

Проект використовує PostgreSQL. Таблиці автоматично ініціалізуються при запуску:

### energy_experiments
```sql
- id (SERIAL PRIMARY KEY)
- angle (FLOAT)
- sunlight (FLOAT)
- temperature (FLOAT)
- dust (FLOAT)
- efficiency (FLOAT)
- created_at (TIMESTAMP)
```

### radiation_experiments
```sql
- id (SERIAL PRIMARY KEY)
- material (TEXT)
- thickness (FLOAT)
- radiation_level (FLOAT)
- penetration (FLOAT)
- created_at (TIMESTAMP)
```

### thermo_experiments
```sql
- id (SERIAL PRIMARY KEY)
- material (TEXT)
- thickness (FLOAT)
- area (FLOAT)
- inside_temp (FLOAT)
- outside_temp (FLOAT)
- coefficient (FLOAT)
- heat_loss (FLOAT)
- recommendation (TEXT)
- created_at (TIMESTAMP)
```

## 🛠️ Технологічний стек

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Additional**: 
  - Chart.js для графіків (LunaEnergy)
  - Tailwind CSS для стилів
  - CORS для кросс-доменних запитів

## 📚 API документація

### Загальні правила:
- Усі запити повинні мати `Content-Type: application/json`
- Помилки повертаються з відповідним HTTP кодом та повідомленням про помилку
- Успішні відповіді повертаються з кодом 200

### Приклади запитів:

#### LunaEnergy - Розрахунок ефективності
```bash
curl -X POST http://localhost:3000/api/energy/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "angle": 30,
    "sunlight": 0.9,
    "temperature": 20,
    "dust": 0.1
  }'
```

#### LunaRadiation - Розрахунок радіації
```bash
curl -X POST http://localhost:3000/api/radiation/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "material": "Алюміній",
    "thickness": 5,
    "radiationLevel": 100
  }'
```

#### LunaThermo - Розрахунок теплопередачі
```bash
curl -X POST http://localhost:3000/api/thermo/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "material": "aluminum",
    "thickness": 0.1,
    "area": 10,
    "insideTemp": 20,
    "outsideTemp": -150
  }'
```

## 🎯 Функціональність

### Спільні можливості для всіх модулів:
- ✅ Розрахунок параметрів
- ✅ Збереження експериментів у БД
- ✅ Перегляд історії експериментів
- ✅ Автоматичне оновлення даних
- ✅ Адаптивний дизайн для мобільних пристроїв

### LunaEnergy - додаткові можливості:
- 📊 Графіки залежностей
- 📈 Статистичний аналіз
- 🔄 Порівняння експериментів
- 📥 Експорт у CSV
- 📚 Теоретичні матеріали

## 📝 Ліцензія

ISC

## 👤 Автор

Luna AI Research Center - 2026

## 🌍 Замітки

Це дослідницький проект, спрямований на вивчення умов Місяця та розробку систем, які можуть сприяти майбутнім місячним колоніям.

Усі розрахунки засновані на фізичних моделях та науковій літературі про космічне середовище.

---

**Приєднуйтесь до дослідження Місяця! 🌕**
