import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';

const app = express();

// Логер HTTP-запитів
app.use(
  pinoHttp({
    // prettyPrint у проді не треба; дивись логи у Render → Logs
  }),
);

// Базові middleware
app.use(cors());
app.use(express.json());

// Роути
app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

// Спеціальний тестовий маршрут для імітації помилки
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// 404 — якщо маршрут не знайдений
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 500 — глобальний обробник помилок (останній middleware)
app.use((err, req, res, next) => {
  if (req.log) req.log.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
