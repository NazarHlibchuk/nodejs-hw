import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// middleware
app.use(logger);
app.use(express.json());
app.use(cors());

// routes
app.use(notesRoutes);

// 404
app.use(notFoundHandler);

// 500 last
app.use(errorHandler);

const { PORT = 3000, MONGO_URL } = process.env;

async function start() {
  if (!MONGO_URL) {
    console.error(' Missing MONGO_URL env variable');
    process.exit(1);
  }

  await connectMongoDB(MONGO_URL);

  app.listen(PORT, () => {
    console.log(` Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(' Failed to start server', err);
  process.exit(1);
});
