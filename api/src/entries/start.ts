/**
 * Entry point for running the API server.
 */
import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import Server from '../server';

dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

const port = parseInt(process.env.PORT || '8080', 10);
new Server().listen(port);
