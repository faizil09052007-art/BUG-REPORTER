import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bugtracker',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'supersecretaccess',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefresh',
  nodeEnv: process.env.NODE_ENV || 'development',
};
