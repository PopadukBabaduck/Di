// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import basicAuth from 'express-basic-auth';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app = express();

// 1) CORS + JSON-парсер
app.use(cors());
app.use(bodyParser.json());

// 2) HTTP Basic Auth для любых URL, начинающихся с /admin
app.use(/^\/admin/, basicAuth({
  users: { 'admin': '20482048' },
  challenge: true,
  realm: 'Admin Area'
}));

// 3) Отдаём статику (index.html, admin.html, css, js и пр.)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// «БД» в памяти
const users = {};

// Хелпер для сегодняшней даты YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0,10);
}

// CREATE
app.post('/api/users', (req, res) => {
  const { ipp, fullName, birthDate, docNumber, status, registrationDate } = req.body;
  if (!ipp) {
    return res.status(400).json({ error: 'ІПН обовʼязковий' });
  }
  const id = uuid();
  users[id] = {
    id,
    ipp,
    fullName: fullName || '',
    birthDate: birthDate || '',
    docNumber: docNumber || '',
    status: status || '—',
    registrationDate: registrationDate || today()
  };
  res.status(201).json(users[id]);
});

// READ all
app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// READ one
app.get('/api/users/:id', (req, res) => {
  const u = users[req.params.id];
  if (!u) return res.status(404).json({ error: 'Не знайдено' });
  res.json(u);
});

// UPDATE
app.put('/api/users/:id', (req, res) => {
  const u = users[req.params.id];
  if (!u) return res.status(404).json({ error: 'Не знайдено' });
  Object.assign(u, req.body);
  res.json(u);
});

// DELETE
app.delete('/api/users/:id', (req, res) => {
  delete users[req.params.id];
  res.status(204).end();
});

// HTML-страницы (на случай, если вы не хотите полагаться только на express.static)
app.get('/',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
