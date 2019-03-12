/**
 * Returns the server's secret for signing things. Keep it safe.
 *
 * @returns Secret string
 */
export default function getSecret(): string {
  const secret = process.env.API_SECRET;
  if (!secret) {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'development' || NODE_ENV === 'test') {
      // Don't require a secret variable during development.
      return 'DEV_ONLY_SECRET_DO_NOT_USE_IN_PRODUCTION';
    }
    throw new Error('You must set the API_SECRET env variable');
  }
  return secret;
}
