import path from 'node:path';
import { initDatabase } from './database';
import { startServer } from './server';
const root = path.join(__dirname, '..');
initDatabase(process.env.DATA_DIR || path.join(root, 'data'));
const port = Number(process.env.PORT || 3000);
startServer({ port, host: '0.0.0.0', staticDirectory: path.join(root, 'dist') });
