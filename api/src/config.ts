import path from 'path';
import { Config as KnexConfig } from 'knex';
import dotenv from 'dotenv';

/**
 * API root directory containing package.json, tsconfig.json, etc.
 */
const rootDir = path.resolve(__dirname, '..');

// Allow project level env variables to be defined in /api/.env
dotenv.config({
  path: path.join(rootDir, '.env'),
});

/**
 * Whether or not the server is running in development mode.
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Whether or not the server is running in a test.
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Whether or not to do runtime validation on action results. Useful for catching bugs during
 * development/tests, but should (probably) be disabled in production.
 */
export const validateActionResults = isDev || isTest;

/**
 * Port used by the webserver.
 */
export const port: number = parseInt(process.env.PORT || '8080', 10);

/**
 * Database files are all stored in the API root directory and are named using NODE_ENV.
 * eg.
 *   production database is /api/production.sqlite3
 *   development database is /api/development.sqlite3
 *   test database is /api/test.sqlite3
 */
export const databaseFilepath = path.join(
  rootDir,
  `${process.env.NODE_ENV}.sqlite3`,
);

/**
 * The database connection config used by knex.
 */
export const knexConfig: KnexConfig = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: databaseFilepath,
  },
};
