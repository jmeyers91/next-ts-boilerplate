import jwt from 'jsonwebtoken';
import getSecret from './getSecret';
import { month } from './timeConstants';

/**
 * Auth token payload shape
 */
export interface AuthTokenPayload {
  id: number;
}

/**
 * Creates a JWT auth token signed using the server's secret.
 *
 * @params payload - The user payload to store in the token.
 * @params expiresIn - How long before the token expires. Defaults to a month.
 * @returns a new JWT token
 */
export default function createAuthToken(
  payload: AuthTokenPayload,
  expiresIn: number = month,
): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: `${expiresIn}ms`,
  });
}
