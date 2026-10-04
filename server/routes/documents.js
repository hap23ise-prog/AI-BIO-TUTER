const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const database = require('../database');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/', (req, res) => {
  const documents = database.prepare(
    'SELECT id, title, filename, created_at FROM documents ORDER BY created_at DESC'
  ).all();
  res.json(documents);
});

router.get('/:id', (req, res) => {
  const document = database.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found.' });

  const chats = database.prepare(
    'SELECT id, question, answer, created_at FROM chats WHERE document_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);
  res.json({ ...document, chats });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please choose a PDF or TXT file.' });

    const extension = req.file.originalname.toLowerCase().split('.').pop();
    if (!['pdf', 'txt'].includes(extension)) {
      return res.status(400).json({ error: 'Only PDF and TXT files are supported.' });
    }

    let content;
    if (extension === 'pdf') {
      const parsedPdf = await pdfParse(req.file.buffer);
      content = parsedPdf.text;
    } else {
      content = req.file.buffer.toString('utf8');
    }

    if (!content.trim()) return res.status(400).json({ error: 'The uploaded file does not contain readable text.' });

    const title = req.body.title?.trim() || req.file.originalname.replace(/\.[^/.]+$/, '');
    const result = database.prepare(
      'INSERT INTO documents (title, filename, content) VALUES (?, ?, ?)'
    ).run(title, req.file.originalname, content.trim());

    res.status(201).json({ id: result.lastInsertRowid, title, filename: req.file.originalname });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'The file could not be processed.' });
  }
});

router.delete('/:id', (req, res) => {
  const result = database.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Document not found.' });
  res.json({ message: 'Document deleted.' });
});

module.exports = router;