/**
 * Entry point for running the API server.
 */
import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import Db from 'src/_core/Db';
import startServer from '../startServer';

dotenv.config({
  path: path.resolve(__dirname, '..', '.env'),
});

const port = parseInt(process.env.PORT || '8080', 10);
startServer(port, Db.getDefault());
