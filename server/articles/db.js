import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'articles.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB open error:', err);
  else console.log('Connected to SQLite at', dbPath);
});

export function initDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pmid TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          authors TEXT,
          journal TEXT,
          pubDate TEXT,
          abstract TEXT,
          url TEXT,
          subspecialty TEXT,
          topic TEXT,
          fetchedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
}

export function insertArticles(articles) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO articles
      (pmid, title, authors, journal, pubDate, abstract, url, subspecialty, topic, fetchedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    db.serialize(() => {
      articles.forEach((a) => {
        stmt.run([a.pmid, a.title, a.authors, a.journal, a.pubDate, a.abstract, a.url, a.subspecialty, a.topic]);
      });
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

export function getArticles(subspecialty) {
  return new Promise((resolve, reject) => {
    const query = subspecialty
      ? `SELECT * FROM articles WHERE subspecialty = ? ORDER BY pubDate DESC LIMIT 50`
      : `SELECT * FROM articles ORDER BY pubDate DESC LIMIT 100`;
    const params = subspecialty ? [subspecialty] : [];

    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function deleteOldArticles(daysOld = 90) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM articles WHERE fetchedAt < datetime('now', '-' || ? || ' days')`,
      [daysOld],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

export default db;
