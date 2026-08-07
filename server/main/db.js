import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'uroapp.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB error:', err);
  else console.log('✓ Connected to SQLite');
});

export function initDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL,
          name TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => { if (err) reject(err); }
      );

      // Patients table
      db.run(
        `CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          name TEXT NOT NULL,
          age INTEGER,
          sex TEXT,
          mrn TEXT,
          location TEXT,
          admission DATETIME,
          reason TEXT,
          pmh TEXT,
          psh TEXT,
          meds TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); }
      );

      // Exam table
      db.run(
        `CREATE TABLE IF NOT EXISTS exams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          general TEXT,
          abdomen TEXT,
          other TEXT,
          FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); }
      );

      // Labs table
      db.run(
        `CREATE TABLE IF NOT EXISTS labs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          hb REAL,
          wbc REAL,
          plt REAL,
          cr REAL,
          egfr REAL,
          na REAL,
          k REAL,
          crp REAL,
          other TEXT,
          FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); }
      );

      // Imaging table
      db.run(
        `CREATE TABLE IF NOT EXISTS imaging (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          findings TEXT,
          FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); }
      );

      // SOAP notes table
      db.run(
        `CREATE TABLE IF NOT EXISTS soapNotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          s TEXT,
          o TEXT,
          a TEXT,
          p TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); }
      );

      // Active issues table
      db.run(
        `CREATE TABLE IF NOT EXISTS activeIssues (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patientId INTEGER NOT NULL,
          issue TEXT,
          FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE
        )`,
        (err) => { if (err) reject(err); resolve(); }
      );
    });
  });
}

export function createUser(email, passwordHash, name) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (email, passwordHash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, name FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function createPatient(userId, data) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO patients (userId, name, age, sex, mrn, location, admission, reason, pmh, psh, meds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.name, data.age, data.sex, data.mrn, data.location, data.admission, data.reason, data.pmh, data.psh, data.meds],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export function getPatientsByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM patients WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function getPatientById(patientId, userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM patients WHERE id = ? AND userId = ?', [patientId, userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function updatePatient(patientId, userId, data) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE patients SET name=?, age=?, sex=?, mrn=?, location=?, admission=?, reason=?, pmh=?, psh=?, meds=?
       WHERE id = ? AND userId = ?`,
      [data.name, data.age, data.sex, data.mrn, data.location, data.admission, data.reason, data.pmh, data.psh, data.meds, patientId, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

export function deletePatient(patientId, userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM patients WHERE id = ? AND userId = ?', [patientId, userId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

export function addSOAPNote(patientId, userId, note) {
  return new Promise((resolve, reject) => {
    // Verify ownership first
    db.get('SELECT id FROM patients WHERE id = ? AND userId = ?', [patientId, userId], (err, patient) => {
      if (err) { reject(err); return; }
      if (!patient) { reject(new Error('Not authorized')); return; }

      db.run(
        'INSERT INTO soapNotes (patientId, s, o, a, p) VALUES (?, ?, ?, ?, ?)',
        [patientId, note.s, note.o, note.a, note.p],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  });
}

export function getSOAPNotes(patientId, userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT s.* FROM soapNotes s
       JOIN patients p ON s.patientId = p.id
       WHERE s.patientId = ? AND p.userId = ?
       ORDER BY s.timestamp DESC`,
      [patientId, userId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

export default db;
