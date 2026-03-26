require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const verifyToken = require('./authMiddleware');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // localhost-ийн бүх port-г зөвшөөрнө
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS хориглогдсон'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'MySystem API ажиллаж байна' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// GET: Хэрэглэгчийн систэмүүдийг авах
app.get('/api/systems', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM systems WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET systems алдаа:', error);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
  }
});

// POST: Шинэ систем бүртгэх
app.post('/api/systems', verifyToken, async (req, res) => {
  try {
    const { systemName, type, rating, description, relatedSystems, developer, duration, isActive } = req.body;

    if (!systemName) {
      return res.status(400).json({ error: 'Системийн нэр шаардлагатай' });
    }

    const result = await pool.query(
      `INSERT INTO systems
        (user_id, system_name, type, rating, description, related_systems, developer, duration, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        systemName,
        type || 'Карт',
        rating || 0,
        description || '',
        relatedSystems || [],
        developer || '',
        duration || null,
        isActive !== undefined ? isActive : true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST systems алдаа:', error);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
  }
});

// DELETE: Систем устгах
app.delete('/api/systems/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      'SELECT id FROM systems WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Систем олдсонгүй эсвэл эрх байхгүй' });
    }

    await pool.query('DELETE FROM systems WHERE id = $1', [id]);
    res.json({ message: 'Систем амжилттай устгагдлаа' });
  } catch (error) {
    console.error('DELETE systems алдаа:', error);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
  }
});

// GET: Бүртгэлтэй хэрэглэгчид (admin view)
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET users алдаа:', error);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер ажиллаж байна: http://localhost:${PORT}`));
