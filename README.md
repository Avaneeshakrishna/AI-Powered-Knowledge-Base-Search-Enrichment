
# AI-Powered Knowledge Base Search & Enrichment

## Challenge Overview
This project is a solution for Challenge 2: AI-Powered Knowledge Base Search & Enrichment.

### Core Concept
Build a system where a user can upload multiple documents, search them in natural language, get AI-generated answers, and flag when the answer is incomplete — then suggest ways to enrich the knowledge base.

### Core Requirements
- **Document Upload & Storage:** Users can upload multiple `.txt` documents. Files are stored locally and listed in the UI for management and deletion.
- **Search:** Users ask questions in plain language. The system uses OpenAI to search and answer using only the uploaded documents.
- **Answer:** AI generates answers based on document content. Answers may mention source documents for traceability.
- **Completeness Check:** The system analyzes AI answers for missing information or uncertainty, using strict rules (length, citation, keyword coverage, redundancy, uncertainty phrases). A confidence/completeness score is shown visually.
- **Enrichment Suggestion:** If the answer is incomplete or uncertain, the system suggests additional documents, data, or actions to fill the gap, using question keywords and answer analysis.

## FullStack Features & UI
- **Intuitive Interface:** Modern React/Material-UI frontend with clear tabs for uploading and searching documents.
- **Document Management:** Upload, list, and delete documents. (Drag-and-drop upload can be added for extra polish.)
- **Natural Language Search:** Search bar for plain language questions.
- **Answer Display:** AI answers are shown, with source citations mentioned in text. (Visual highlighting can be added as a future enhancement.)
- **Confidence/Completeness Gauge:** Visual indicator (gauge) shows how complete/confident the answer is, based on backend scoring.
- **Enrichment Suggestions:** Actionable suggestions are displayed to help users improve their knowledge base.
- **Responsive Layout:** UI adapts to desktop and mobile screens.
- **Instant Feedback:** Answers, confidence, and suggestions update immediately after search.

## Design Decisions
- **Frontend:** React + Material-UI for rapid development, modularity, and responsive design.
- **Backend:** Node.js/Express with OpenAI for semantic search and answer generation. Multer for uploads. All logic in one file for speed.
- **Document Handling:** Only `.txt` files supported for simplicity. Each document is standalone; supporting document relationships are not implemented.
- **Confidence & Enrichment:** Strict, rule-based scoring and suggestions for explainability and transparency.
- **No Database (Prototype):** In-memory storage for speed; SQLite recommended for production.

## Trade-offs Due to 24h Constraint
- **No Database:** In-memory storage limits persistence and scalability, but enables rapid prototyping.
- **Minimal Testing:** Automated tests and advanced error handling omitted to focus on core features.
- **Single-File Backend:** All backend logic in `server.js` for simplicity, at the cost of modularity.
- **Basic NLP:** Keyword extraction and enrichment logic use regex and filtering, not advanced NLP libraries.
- **Limited File Types:** Only `.txt` files supported for upload and search.
- **Frontend Polish:** UI is functional and clean, but advanced features (drag-and-drop, multi-user, real-time updates) are not included.
- **Source Citation Highlighting:** Citations are mentioned in answers, but not visually highlighted in the UI (can be added).

## How to Run/Test the System

### Prerequisites
- Node.js (v16+ recommended)
- npm
- OpenAI API key (set in `.env` as `OPENAI_API_KEY`)

### Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your-key-here
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage
- Upload `.txt` documents using the Upload tab.
- Search for answers using the search bar.
- View AI-generated answers, confidence scores, and enrichment suggestions.
- Click the logo to hard reload the app (Ctrl+Shift+R).

## Extending the System
- **Database Integration:** For persistence, add SQLite or another DB and update backend logic.
- **Advanced NLP:** Integrate libraries like spaCy or NLTK for better keyword extraction and enrichment.
- **Multi-user Support:** Add authentication and user-specific document management.
- **File Type Support:** Extend upload logic to support PDFs, Word docs, etc.
- **Source Highlighting:** Add visual highlighting for source citations in the answer display.

## Contact
For questions or contributions, contact [Avaneeshakrishna](mailto:avaneesh.shastry@gmail.com).
