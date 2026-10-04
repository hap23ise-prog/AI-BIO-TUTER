require('dotenv').config();

const path = require('path');
const express = require('express');
const documentsRouter = require('./routes/documents');
const chatRouter = require('./routes/chat');
require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`AI Study Assistant is running at http://localhost:${port}`);
});