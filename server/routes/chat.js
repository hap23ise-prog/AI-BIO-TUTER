const express = require('express');
const database = require('../database');
const { answerQuestion } = require('../openai');

const router = express.Router();

router.post('/', async (req, res) => {
  const { documentId, question } = req.body;
  if (!documentId || !question?.trim()) {
    return res.status(400).json({ error: 'Select a document and enter a question.' });
  }

  const document = database.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is missing in the .env file.' });

  try {
    const answer = await answerQuestion(document.content, question.trim());
    const result = database.prepare(
      'INSERT INTO chats (document_id, question, answer) VALUES (?, ?, ?)'
    ).run(documentId, question.trim(), answer);

    res.json({ id: result.lastInsertRowid, question: question.trim(), answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'OpenAI could not answer right now. Check your API key and try again.' });
  }
});

router.delete('/:documentId', (req, res) => {
  database.prepare('DELETE FROM chats WHERE document_id = ?').run(req.params.documentId);
  res.json({ message: 'Chat history cleared.' });
});

module.exports = router;