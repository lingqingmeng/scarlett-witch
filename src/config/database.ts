import { Sequelize } from 'sequelize';
import env from './env';

const sequelize = new Sequelize(env.databaseUrl, {
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
});

export default sequelize;
