const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const DATA_FILE = path.join(__dirname, 'data', 'news.json');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Por favor define la variable de entorno MONGODB_URI antes de ejecutar este script.');
  process.exit(1);
}

async function run() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');

    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB, migrando', arr.length, 'documentos...');

    const newsSchema = new mongoose.Schema({
      id: String,
      title: String,
      content: String,
      sourceUrl: String,
      author: String,
      createdAt: Date
    });
    const News = mongoose.model('News_migration', newsSchema);

    if (arr.length === 0) {
      console.log('No hay documentos para migrar.');
      process.exit(0);
    }

    const docs = arr.map(it => ({ ...it, createdAt: new Date(it.createdAt) }));
    await News.insertMany(docs);
    console.log('Migración completada OK.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error durante la migración:', err);
    process.exit(1);
  }
}

run();
