import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'articles.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

db.run('DELETE FROM articles', (err) => {
  if (err) {
    console.error('Error deleting articles:', err);
    process.exit(1);
  }
  console.log('✅ All articles cleared');
  db.close();
  process.exit(0);
});
