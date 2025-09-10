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
      uploadedAt: new Date().toISOString(),
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
  let allEmpty = true;
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
      if (content.trim().length > 0) allEmpty = false;
      context += `Document: ${doc.name}\n${content}\n\n`;
      sources.push({ id: doc.id, name: doc.name });
    } catch (e) {
      console.error(`Error reading file ${doc.name}:`, e);
    }
  }
  let answer = '';
  if (allEmpty) {
    answer = 'The selected documents are empty and contain no content to analyze. Please upload documents with actual information.';
  } else {
    const prompt = `You are an expert assistant. Given the following documents and a user question, answer using only the information in the documents. Cite the document names in your answer.\n\n${context}\nUser question: ${query}`;
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
  }
  res.json({ answer, sources });
});

// Completeness check
app.post('/api/completeness', express.json(), (req, res) => {
  const { answer, question } = req.body;
  let confidence = 0.3;
  // Lower confidence for empty document answers
  if (/empty and contain no content to analyze|no content to analyze|document is empty|file is empty|no actual information/i.test(answer)) {
    confidence = 0.05;
  } else if (/cannot summarize|cannot provide a summary|unable to summarize|only code|no textual content|not textual|no summary available|no summary|no content to summarize|not possible to summarize|not possible|no information|no info|no useful information|no useful content|no answer|not explicitly mentioned|cannot determine|not found in the documents|not found|no information about the author|no author mentioned|author not mentioned|author unknown|no author info|no author information|no author found|no details about the author|no details found|no details available|no details provided|no details/i.test(answer)) {
    confidence = 0.1;
  } else {
    
    if (answer.length < 30) confidence -= 0.2;
    // Increase confidence for longer answers
    if (answer.length > 100) confidence += 0.3;
    // Increase confidence if sources are cited
    if (/source|document|\.txt|reference|cited/i.test(answer)) confidence += 0.2;
    // Lower confidence if uncertainty phrases are present
    if (/not enough info|cannot answer|don't know|insufficient|uncertain|maybe|possibly|unclear|unknown|guess|estimate/i.test(answer)) confidence -= 0.3;
    // Penalize vague answers
    if (/vague|general|generic|unclear|not specific|not detailed|not enough detail/i.test(answer)) confidence -= 0.2;
    // Penalize answers that repeat phrases (simple redundancy check)
    const sentences = answer.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
    const uniqueSentences = new Set(sentences);
    if (uniqueSentences.size < sentences.length - 2) confidence -= 0.1;
    // Penalize if answer does not mention any keyword from question
    if (question) {
      const qWords = question.split(/\W+/).map(w => w.toLowerCase()).filter(w => w.length > 3);
      const aWords = answer.toLowerCase();
      let missingKeywords = 0;
      qWords.forEach(kw => { if (!aWords.includes(kw)) missingKeywords++; });
      if (missingKeywords > Math.floor(qWords.length / 2)) confidence -= 0.2;
    }
    // Clamp between 0 and 1
    confidence = Math.max(0, Math.min(1, confidence));
  }
  res.json({ confidence });
});

// Enrichment suggestions (improved)
app.post('/api/enrich', express.json(), (req, res) => {
  const { answer, question, userFeedback } = req.body;
  let suggestions = [];

  // Check for uncertainty or lack of info
  if (/no relevant info|not enough info|cannot answer|don't know|insufficient|uncertain/i.test(answer)) {
    suggestions.push('Upload more documents');
    suggestions.push('Try a different query');
  }

  // Check for lack of sources
  if (!/source|document|\.txt|reference|cited/i.test(answer)) {
    suggestions.push('Include more cited sources in your documents');
  }

  // Check for short or vague answers
  if (answer.length < 50) {
    suggestions.push('Add more detailed files');
  }

  // Improved keyword extraction: use question keywords, filter out stopwords
  if (question) {
    const stopwords = ['what','which','who','whom','this','that','these','those','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','can','could','may','might','must','the','a','an','and','or','but','if','then','else','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
    const qWords = question.split(/\W+/).map(w => w.toLowerCase()).filter(w => w.length > 3 && !stopwords.includes(w));
    const aWords = answer.toLowerCase();
    qWords.forEach(kw => {
      if (!aWords.includes(kw)) suggestions.push(`Upload documents covering "${kw}"`);
    });
  }

  // Suggest document type based on question intent
  if (question && /summary|report|analysis|manual|guide|case study|data|example/i.test(question)) {
    if (/summary|report/i.test(question)) suggestions.push('Upload a summary report');
    if (/analysis/i.test(question)) suggestions.push('Upload an analysis document');
    if (/manual|guide/i.test(question)) suggestions.push('Upload a technical manual or guide');
    if (/case study/i.test(question)) suggestions.push('Upload case studies');
    if (/data/i.test(question)) suggestions.push('Add quantitative data');
    if (/example/i.test(question)) suggestions.push('Provide example documents');
  }

  // Source diversity: if only one document is cited
  const citedDocs = answer.match(/Document: ([^\s]+)/g);
  if (citedDocs && citedDocs.length === 1) suggestions.push('Upload more documents for broader coverage');

  // Vague/redundant answer detection
  if (/vague|generic|unclear|not specific|not detailed|not enough detail/i.test(answer)) {
    suggestions.push('Clarify document content or add more specific details');
  }
  // Redundancy: repeated sentences
  const sentences = answer.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
  const uniqueSentences = new Set(sentences);
  if (uniqueSentences.size < sentences.length - 2) suggestions.push('Remove duplicate information from your documents');

  // User feedback integration
  if (userFeedback && userFeedback.incomplete) {
    suggestions.push('User marked answer as incomplete. Please upload more relevant documents or clarify content.');
  }

  // Fallback if no suggestions
  if (suggestions.length === 0) {
    suggestions.push('Add recent reports');
    suggestions.push('Include more detailed files');
  }

  res.json({ suggestions });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});