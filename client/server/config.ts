import path from 'path';
import nextConfig from './next.config';
const { env } = process;

/**
 * Port to host the server on. Loaded from `process.env.PORT`. Defaults to 3000.
 */
export const port = parseInt(env.PORT || '3000', 10);

/**
 * Client root directory that gets passed to Next.
 */
export const dir = path.resolve(__dirname, '..', 'src');

/**
 * Development flag passed to Next. Enables/disables the webpack dev server.
 */
export const dev = env.NODE_ENV === 'development';

/**
 * The exported value of next.config.js that gets passed to Next.
 */
export const conf = nextConfig;

/**
 * API server url for proxying API requests from the client. Loaded from `process.env.API_URL`.
 * Defaults to localhost during development/testing.
 * Throws if missing in production.
 */
export const apiUrl = getApiUrl();

/**
 * Loads the API server url from the environmental variable API_VARIABLE.
 * Defaults to localhost during development.
 * Throws if missing in production.
 *
 * @returns API server url
 */
function getApiUrl(): string {
  if (env.API_URL) {
    return env.API_URL;
  } else if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
    return `http://localhost:${env.PORT || 8080}`;
  } else {
    throw new Error(
      `You must set the API_URL env variable to the URL of the API server.`,
    );
  }
}
