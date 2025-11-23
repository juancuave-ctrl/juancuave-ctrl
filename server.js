const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'news.json');

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose schema (used only if MONGODB_URI is provided)
let NewsModel = null;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

  const newsSchema = new mongoose.Schema({
    id: String,
    title: String,
    content: String,
    sourceUrl: String,
    author: String,
    createdAt: Date
  });

  NewsModel = mongoose.model('News', newsSchema);
}

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

app.get('/api/news', async (req, res) => {
  try {
    if (NewsModel) {
      const items = await NewsModel.find().sort({ createdAt: -1 }).lean();
      return res.json(items);
    }
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(arr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error leyendo datos' });
  }
});

app.post('/api/news', async (req, res) => {
  const { title, content, sourceUrl, author } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title y content son requeridos' });
  try {
    const item = {
      id: Date.now().toString(),
      title,
      content,
      sourceUrl: sourceUrl || null,
      author: author || 'Anónimo',
      createdAt: new Date().toISOString()
    };

    if (NewsModel) {
      const doc = new NewsModel({ ...item, createdAt: new Date(item.createdAt) });
      await doc.save();
      return res.status(201).json(doc);
    }

    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.push(item);
    await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando noticia' });
  }
});

const PORT = process.env.PORT || 3000;
ensureDataFile().then(() => {
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});
