import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : undefined;

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins ?? true,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
