import app from './app';
import env from './config/env';
import sequelize from './config/database';
import { ensureContentDir } from './services/postService';

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureContentDir();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
