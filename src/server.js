import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors as celebrateErrors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(logger);
app.use(express.json());
app.use(cors());

app.use(notesRoutes);

// 404 для всього, що не збіглося
app.use(notFoundHandler);

// помилки від celebrate (валідація)
app.use(celebrateErrors());

// глобальний обробник (http-errors/інші)
app.use(errorHandler);

const { PORT = 3000, MONGO_URL } = process.env;

async function start() {
  if (!MONGO_URL) {
    console.error('❌ Missing MONGO_URL env variable');
    process.exit(1);
  }
  await connectMongoDB(MONGO_URL);
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
}

start().catch((e) => {
  console.error('❌ Failed to start server', e);
  process.exit(1);
});
