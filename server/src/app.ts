import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
