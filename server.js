/**
 * Conexão Solidária — API Backend
 * Node.js + Express · persistência em JSON
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'inscricoes.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

async function ensureData() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ inscricoes: [], contador: 0 }, null, 2));
  }
}

async function readDb() {
  await ensureData();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'conexao-solidaria-api' });
});

app.get('/api/stats', async (_req, res) => {
  try {
    const db = await readDb();
    res.json({ contador: db.contador ?? 0 });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler estatísticas.' });
  }
});

app.get('/api/inscricao/check', async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email || '');
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
    const db = await readDb();
    const exists = db.inscricoes.some((i) => i.email === email);
    res.json({ exists });
  } catch {
    res.status(500).json({ error: 'Erro na verificação.' });
  }
});

app.post('/api/inscricao', async (req, res) => {
  try {
    const { nome, idade, email, motivo } = req.body || {};
    if (!nome || nome.length < 3) return res.status(400).json({ error: 'Nome inválido.' });
    const age = Number(idade);
    if (!Number.isInteger(age) || age < 14 || age > 120) {
      return res.status(400).json({ error: 'Idade mínima: 14 anos.' });
    }
    const mail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }
    if (!motivo || motivo.length < 20) {
      return res.status(400).json({ error: 'Motivação muito curta (mín. 20 caracteres).' });
    }

    const db = await readDb();
    if (db.inscricoes.some((i) => i.email === mail)) {
      return res.status(409).json({ error: 'Você já está inscrito(a) nesta ação voluntária.' });
    }

    const entry = {
      nome: String(nome).trim(),
      idade: age,
      email: mail,
      motivo: String(motivo).trim(),
      inscritoEm: new Date().toISOString(),
    };

    db.inscricoes.push(entry);
    db.contador = db.inscricoes.length;
    await writeDb(db);

    res.status(201).json({
      message: 'Inscrição registrada com sucesso!',
      contador: db.contador,
      inscricao: { nome: entry.nome, email: entry.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar inscrição.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

await ensureData();
app.listen(PORT, () => {
  console.log(`Conexão Solidária → http://localhost:${PORT}`);
});
