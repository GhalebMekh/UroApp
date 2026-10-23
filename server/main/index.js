import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDB, createUser, getUserByEmail, getUserById, createPatient, getPatientsByUserId, getPatientById, updatePatient, deletePatient, addSOAPNote, getSOAPNotes } from './db.js';

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Initialize database
await initDB();

// ============ MIDDLEWARE ============

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ============ AUTH ENDPOINTS ============

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const displayName = (name || '').trim() || 'Resident';
    const hash = await bcrypt.hash(password, 10);
    const userId = await createUser(email, hash, displayName);

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, userId, name: displayName });
  } catch (e) {
    // The unique index on users.email is what stops a second account being
    // created for the same person; say so plainly instead of leaking SQL.
    if (String(e.message).includes('UNIQUE constraint failed')) {
      return res
        .status(409)
        .json({ error: 'An account already exists for this email. Log in instead.' });
    }
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, userId: user.id, name: user.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ PATIENT ENDPOINTS ============

app.get('/api/patients', verifyToken, async (req, res) => {
  try {
    const patients = await getPatientsByUserId(req.userId);
    res.json(patients);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/patients', verifyToken, async (req, res) => {
  try {
    const patientId = await createPatient(req.userId, req.body);
    res.json({ success: true, patientId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/patients/:id', verifyToken, async (req, res) => {
  try {
    const patient = await getPatientById(req.params.id, req.userId);
    if (!patient) return res.status(404).json({ error: 'Not found' });

    // Get related data
    const soapNotes = await getSOAPNotes(req.params.id, req.userId);
    res.json({ ...patient, soapNotes });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/patients/:id', verifyToken, async (req, res) => {
  try {
    const changes = await updatePatient(req.params.id, req.userId, req.body);
    if (changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/patients/:id', verifyToken, async (req, res) => {
  try {
    const changes = await deletePatient(req.params.id, req.userId);
    if (changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ SOAP NOTES ============

app.post('/api/patients/:id/soap', verifyToken, async (req, res) => {
  try {
    const noteId = await addSOAPNote(req.params.id, req.userId, req.body);
    res.json({ success: true, noteId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/patients/:id/soap', verifyToken, async (req, res) => {
  try {
    const notes = await getSOAPNotes(req.params.id, req.userId);
    res.json(notes);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ============ HEALTH ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'UroApp Backend' });
});

// ============ START ============

app.listen(PORT, () => {
  console.log(`\n✨ UroApp Backend on http://localhost:${PORT}`);
  console.log(`   POST   /api/auth/signup`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me (auth required)`);
  console.log(`   GET    /api/patients (auth required)`);
  console.log(`   POST   /api/patients (auth required)`);
  console.log(`   GET    /api/patients/:id (auth required)`);
  console.log(`   PUT    /api/patients/:id (auth required)`);
  console.log(`   DELETE /api/patients/:id (auth required)`);
  console.log(`   POST   /api/patients/:id/soap (auth required)\n`);
});
