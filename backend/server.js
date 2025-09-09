
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
// import pdfParse from 'pdf-parse';
import dotenv from 'dotenv/config';

// Load OpenAI API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const port = 4000;
const DOCS_DIR = path.join(process.cwd(), 'documents');

// Ensure documents directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}


// In-memory metadata store
let documents = [];

// On startup, scan documents folder and rebuild documents array
try {
  const files = fs.readdirSync(DOCS_DIR);
  documents = files.filter(f => f.endsWith('.txt')).map(f => {
    const stats = fs.statSync(path.join(DOCS_DIR, f));
    return {
      id: stats.birthtimeMs + Math.random(),
      name: f.split('-').slice(1).join('-'),
      filename: f,
      path: path.join(DOCS_DIR, f),
      uploadedAt: stats.birthtime
    };
  });
} catch (e) {
  documents = [];
}

// Multer setup for file uploads (disk storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCS_DIR);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Allow CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
  next();
});

// Upload documents
app.post('/api/upload', upload.array('files'), (req, res) => {
  req.files.forEach(file => {
    const id = Date.now() + Math.random();
    documents.push({
      id,
      name: file.originalname,
      filename: file.filename,
      path: file.path,
      uploadedAt: new Date().toISOString()
    });
  });
  res.json({ success: true, count: documents.length });
});

// List documents
app.get('/api/documents', (req, res) => {
  res.json(documents.map(doc => ({ id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt })));
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
  const id = Number(req.params.id);
  const doc = documents.find(d => d.id === id);
  if (doc) {
    try {
      fs.unlinkSync(doc.path);
    } catch (e) {
      // File may not exist
    }
    documents = documents.filter(d => d.id !== id);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Document not found' });
  }
});

// Search documents (OpenAI integration)
app.post('/api/search', express.json(), async (req, res) => {
  const { query } = req.body;
  console.log('Received /api/search request:', { query });
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key missing!');
    return res.status(500).json({ answer: 'OpenAI API key missing.', sources: [] });
  }
  if (!documents || documents.length === 0) {
    console.warn('No documents uploaded.');
    return res.status(400).json({ answer: 'No documents uploaded. Please upload documents before searching.', sources: [] });
  }

  // Detect if query mentions a specific document
  const lowerQuery = query.toLowerCase();
  const mentionedDocs = documents.filter(doc => lowerQuery.includes(doc.name.toLowerCase()));
  let docsToUse = mentionedDocs.length > 0 ? mentionedDocs : documents;

  let context = '';
  let sources = [];
  for (const doc of docsToUse) {
    try {
      const ext = path.extname(doc.name).toLowerCase();
      console.log(`Reading document: ${doc.name}, extension: ${ext}`);
      let content = '';
      if (!fs.existsSync(doc.path)) {
        console.warn(`File not found: ${doc.path}. Skipping.`);
        continue;
      }
      if (ext === '.txt') {
        content = fs.readFileSync(doc.path, 'utf-8');
      } else {
        content = '[Unsupported file type. Only .txt files are supported.]';
      }
      context += `Document: ${doc.name}\n${content}\n\n`;
      sources.push({ id: doc.id, name: doc.name });
    } catch (e) {
      console.error(`Error reading file ${doc.name}:`, e);
    }
  }
  const prompt = `You are an expert assistant. Given the following documents and a user question, answer using only the information in the documents. Cite the document names in your answer.\n\n${context}\nUser question: ${query}`;
  let answer = '';
  try {
    console.log('Sending prompt to OpenAI:', prompt.slice(0, 500));
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You answer questions using only the provided documents and cite sources.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300
    });
    answer = completion.choices[0].message.content;
    console.log('OpenAI response:', answer);
  } catch (err) {
    console.error('Error from OpenAI:', err);
    answer = 'Error generating answer from OpenAI.';
  }
  res.json({ answer, sources });
});

// Completeness check (mock)
app.post('/api/completeness', express.json(), (req, res) => {
  const { answer } = req.body;
  let confidence = 0.3;
  // Increase confidence for longer answers
  if (answer.length > 30) confidence += 0.3;
  // Increase confidence if sources are cited
  if (/source|document|\.txt|reference|cited/i.test(answer)) confidence += 0.2;
  // Lower confidence if uncertainty phrases are present
  if (/not enough info|cannot answer|don't know|insufficient|uncertain/i.test(answer)) confidence -= 0.3;
  // Clamp between 0 and 1
  confidence = Math.max(0, Math.min(1, confidence));
  res.json({ confidence });
});

// Enrichment suggestions (mock)
app.post('/api/enrich', express.json(), (req, res) => {
  const { answer } = req.body;
  const suggestions = answer.includes('No relevant info')
    ? ['Upload more documents', 'Try a different query']
    : ['Add recent reports', 'Include more detailed files'];
  res.json({ suggestions });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});