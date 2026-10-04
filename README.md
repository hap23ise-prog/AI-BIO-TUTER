# AI Study Assistant

A simple, beginner-friendly web application for uploading study materials and asking questions about them.

```text
HTML/CSS/JavaScript -> fetch() -> Express.js -> SQLite/OpenAI -> JSON -> browser
```

## Features

- Upload PDF and TXT study materials.
- Extract PDF text with `pdf-parse` and read TXT files directly.
- Store document titles and extracted text in SQLite.
- Ask questions about a selected document and save chat history.
- Listen to answers with the browser's built-in SpeechSynthesis API.
- Delete materials, clear visible chat, and use the responsive dashboard on mobile or desktop.

## Tech Stack

- Frontend: HTML, CSS, and vanilla JavaScript
- Backend: Node.js and Express.js
- Database: SQLite with `better-sqlite3`
- AI: OpenAI API
- PDF processing: `pdf-parse`

## Folder Structure

```text
StudyAssistant/
├── public/                  # HTML, CSS, and browser JavaScript
├── server/
│   ├── server.js            # Express app and server entry point
│   ├── database.js          # SQLite connection and tables
│   ├── openai.js            # Small OpenAI helper
│   └── routes/
│       ├── documents.js     # Upload, list, open, and delete routes
│       └── chat.js          # Question answering route
├── uploads/                 # Reserved for uploaded files
├── .env.example
├── package.json
└── README.md
```

## How It Works

1. The browser sends a PDF or TXT file to `POST /api/documents/upload` with `fetch()`.
2. Express extracts PDF text or reads TXT text, then stores it in SQLite.
3. The browser lists the saved documents and lets the user select one.
4. A question is sent to `POST /api/chat` with the selected document ID.
5. Express reads the document from SQLite and sends its content plus the question to OpenAI.
6. The answer is saved in SQLite and returned as JSON.
7. JavaScript displays the answer with Listen and Stop controls.

The `documents` table stores `id`, `title`, `filename`, `content`, and `created_at`. The `chats` table stores `id`, `document_id`, `question`, `answer`, and `created_at`. The foreign key links chat history to its document.

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and add your key:

```powershell
Copy-Item .env.example .env
```

```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

The key is read only by the backend and never appears in frontend JavaScript.

Start the application:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Example Usage

1. Upload notes containing `Binary Search works on sorted arrays`.
2. Click the material in the library.
3. Ask `What is Binary Search?`.
4. The answer appears in the chat and can be read aloud.

If the answer is not in the uploaded material, the AI is instructed to say that the information is not present instead of inventing it.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/documents/upload` | Upload and process a PDF or TXT file |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/:id` | Get one document and chat history |
| DELETE | `/api/documents/:id` | Delete a document and its chats |
| POST | `/api/chat` | Ask OpenAI about a selected document |
| DELETE | `/api/chat/:documentId` | Clear a document's chat history |

## Interview Explanation

This project deliberately uses a straightforward request flow. Vanilla JavaScript uses `fetch()` to call Express routes. The document route extracts text and inserts it into SQLite. The chat route reads that text, combines it with the question, and calls OpenAI. It stores the returned answer in SQLite before sending JSON back to the browser. Text-to-speech is handled by the browser, so no separate audio service is needed.

There are no React components, FastAPI routes, Groq calls, embeddings, vector databases, LangChain, or cloud databases.
- **Icons:** react-icons

## 📋 Requirements

### Backend (Python)
- fastapi >= 0.104.1
- uvicorn >= 0.24.0
- sqlalchemy >= 2.0.23
- python-dotenv >= 1.0.0
- pydantic >= 2.5.0
- openai >= 1.3.5
- pyttsx3 >= 2.90
- pypdf >= 3.17.1

### Frontend (Node.js)
- react >= 18.2.0
- react-dom >= 18.2.0
- axios >= 1.6.2
- react-icons >= 4.12.0
- vite >= 5.0.8

## 🎮 How to Use

1. **Add Notes:**
   - Click "Add Notes" button
   - Choose between typing or uploading a file
   - System will automatically summarize

2. **Ask Questions:**
   - Select a note from the left sidebar
   - Type your question in the chat box
   - Get instant AI-powered answers

3. **Learn Concepts:**
   - Click "Explain" button to get concept explanation
   - Click "Examples" to get real-world examples
   - All responses include voice output

4. **Listen:**
   - Click the play button to listen to AI explanations
   - Perfect for auditory learners
   - Pause/resume as needed

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep your OpenAI API key private
- Use environment variables for sensitive data
- In production, use proper authentication

## 📝 Development Tips

### Adding New Features

1. **Backend:**
   - Add new route in `app/routes/`
   - Create service method in `app/services/`
   - Update schemas in `app/schemas.py`

2. **Frontend:**
   - Create component in `src/components/`
   - Update API calls in `src/api.js`
   - Style with CSS modules or global CSS

### Database Management

```bash
# SQLite database is auto-created
# For SQLite, the DB file is at: backend/study_assistant.db

# For migrations (if needed), add Alembic later
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify Python version >= 3.10
- Check `.env` file exists
- Verify OpenAI API key is valid

### Frontend shows 404 errors
- Check if backend is running on port 8000
- Verify API URL in `.env` matches VITE_API_URL
- Check browser console for CORS errors

### Audio not playing
- Ensure speaker is connected
- Check browser permissions for audio
- Verify backend audio files exist

### Upload fails
- Check file size (limit: 50MB)
- Verify file format (PDF, TXT, MD)
- Check disk space in `uploads/` folder

## 📦 Deployment

### Backend Deployment (using Railway/Heroku)
```bash
# Create Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT

# Deploy
git push heroku main
```

### Frontend Deployment (using Vercel)
```bash
# Build
npm run build

# Deploy to Vercel
vercel
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Happy Learning! 🎓**
