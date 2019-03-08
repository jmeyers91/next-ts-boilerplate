import path from 'path';
import nextConfig from './next.config';

const { env } = process;
export const dir = path.resolve(__dirname, '..', 'src');
export const apiUrl =
  process.env.API_URL || `http://localhost:${env.API_PORT || 8080}`;
export const conf = nextConfig;
