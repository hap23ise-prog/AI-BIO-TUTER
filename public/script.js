const fileInput = document.querySelector('#file-input');
const dropZone = document.querySelector('#drop-zone');
const uploadButton = document.querySelector('#upload-button');
const selectedFileLabel = document.querySelector('#selected-file');
const documentList = document.querySelector('#document-list');
const emptyLibrary = document.querySelector('#empty-library');
const documentCount = document.querySelector('#document-count');
const selectedTitle = document.querySelector('#selected-title');
const chatMessages = document.querySelector('#chat-messages');
const questionInput = document.querySelector('#question-input');
const askButton = document.querySelector('#ask-button');
const chatForm = document.querySelector('#chat-form');
const clearChatButton = document.querySelector('#clear-chat');
const message = document.querySelector('#message');

let selectedFile = null;
let selectedDocument = null;

function showMessage(text) {
  message.textContent = text;
  message.classList.add('visible');
  setTimeout(() => message.classList.remove('visible'), 5000);
}

function chooseFile(file) {
  if (!file) return;
  const extension = file.name.toLowerCase().split('.').pop();
  if (!['pdf', 'txt'].includes(extension)) return showMessage('Please choose a PDF or TXT file.');
  selectedFile = file;
  selectedFileLabel.textContent = file.name;
  uploadButton.disabled = false;
}

fileInput.addEventListener('change', () => chooseFile(fileInput.files[0]));
['dragenter', 'dragover'].forEach(eventName => dropZone.addEventListener(eventName, event => {
  event.preventDefault(); dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach(eventName => dropZone.addEventListener(eventName, event => {
  event.preventDefault(); dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', event => chooseFile(event.dataTransfer.files[0]));

uploadButton.addEventListener('click', async () => {
  if (!selectedFile) return;
  uploadButton.disabled = true;
  uploadButton.innerHTML = 'Reading file...';
  const formData = new FormData();
  formData.append('file', selectedFile);
  try {
    const response = await fetch('/api/documents/upload', { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    selectedFile = null;
    fileInput.value = '';
    selectedFileLabel.textContent = 'No file selected';
    await loadDocuments();
    await selectDocument(result.id);
    showMessage('Study material uploaded successfully.');
  } catch (error) { showMessage(error.message); }
  uploadButton.innerHTML = 'Upload material <span>→</span>';
  uploadButton.disabled = !selectedFile;
});

async function loadDocuments() {
  const response = await fetch('/api/documents');
  const documents = await response.json();
  documentCount.textContent = documents.length;
  emptyLibrary.style.display = documents.length ? 'none' : 'block';
  documentList.innerHTML = documents.map(document => `
    <article class="document-card ${selectedDocument?.id === document.id ? 'selected' : ''}" data-id="${document.id}">
      <span class="document-title" title="${escapeHtml(document.title)}">${escapeHtml(document.title)}</span>
      <div class="document-meta"><span>${new Date(document.created_at + 'Z').toLocaleDateString()}</span><button class="delete-button" data-delete="${document.id}">Delete</button></div>
    </article>`).join('');
  documentList.querySelectorAll('.document-card').forEach(card => card.addEventListener('click', () => selectDocument(card.dataset.id)));
  documentList.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', deleteDocument));
}

async function selectDocument(id) {
  const response = await fetch(`/api/documents/${id}`);
  if (!response.ok) return showMessage('Could not open that document.');
  selectedDocument = await response.json();
  selectedTitle.textContent = selectedDocument.title;
  questionInput.disabled = false;
  askButton.disabled = false;
  clearChatButton.disabled = false;
  renderChats(selectedDocument.chats);
  loadDocuments();
}

function renderChats(chats) {
  if (!chats.length) {
    chatMessages.innerHTML = '<div class="welcome-message"><div class="welcome-icon">✦</div><h3>Ready when you are</h3><p>Ask your first question about this material. Keep it specific for the clearest answer.</p></div>';
    return;
  }
  chatMessages.innerHTML = chats.map(chat => chatMarkup(chat.question, chat.answer)).join('');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function chatMarkup(question, answer) {
  return `<div class="chat-item user"><div class="chat-label">YOU</div><div class="bubble">${escapeHtml(question)}</div></div>
    <div class="chat-item"><div class="chat-label">AI TUTOR</div><div class="bubble">${escapeHtml(answer)}</div><div class="speech-controls"><button data-speak="${encodeURIComponent(answer)}">🔊 Listen</button><button data-stop>⏹ Stop</button></div></div>`;
}

chatMessages.addEventListener('click', event => {
  if (event.target.dataset.speak) speechSynthesis.speak(new SpeechSynthesisUtterance(decodeURIComponent(event.target.dataset.speak)));
  if (event.target.hasAttribute('data-stop')) speechSynthesis.cancel();
});

chatForm.addEventListener('submit', async event => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!selectedDocument || !question) return;
  askButton.disabled = true;
  questionInput.disabled = true;
  chatMessages.insertAdjacentHTML('beforeend', `<div class="chat-item user"><div class="chat-label">YOU</div><div class="bubble">${escapeHtml(question)}</div></div><div class="loading" id="loading">AI tutor is thinking...</div>`);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  try {
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId: selectedDocument.id, question }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    document.querySelector('#loading')?.remove();
    chatMessages.insertAdjacentHTML('beforeend', chatMarkup(result.question, result.answer));
    questionInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) { document.querySelector('#loading')?.remove(); showMessage(error.message); }
  askButton.disabled = false;
  questionInput.disabled = false;
  questionInput.focus();
});

questionInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chatForm.requestSubmit(); }
});
clearChatButton.addEventListener('click', async () => {
  if (!selectedDocument || !confirm('Clear this document\'s chat history?')) return;
  const response = await fetch(`/api/chat/${selectedDocument.id}`, { method: 'DELETE' });
  if (!response.ok) return showMessage('Could not clear the chat history.');
  selectedDocument.chats = [];
  renderChats([]);
});

async function deleteDocument(event) {
  event.stopPropagation();
  const id = event.target.dataset.delete;
  if (!confirm('Delete this study material and its chat history?')) return;
  const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  if (!response.ok) return showMessage('Could not delete the document.');
  if (selectedDocument?.id === Number(id)) {
    selectedDocument = null; selectedTitle.textContent = 'Select a material to begin';
    questionInput.disabled = true; askButton.disabled = true; clearChatButton.disabled = true;
    chatMessages.innerHTML = '<div class="welcome-message"><div class="welcome-icon">✦</div><h3>Your study session starts here</h3><p>Choose a material from your library, then ask a question about it.</p></div>';
  }
  loadDocuments();
}

function escapeHtml(value) { return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
loadDocuments().catch(() => showMessage('The server is unavailable. Start it with npm start.'));