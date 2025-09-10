# AI-Powered Knowledge Base Search & Enrichment

## Overview
This project is an AI-powered knowledge base system that allows users to upload documents, search for answers, and receive confidence scores and enrichment suggestions. The system is designed for rapid prototyping and demonstration, with a focus on usability, explainability, and extensibility.

## Design Decisions
- **Frontend:** Built with React and Material-UI for a modern, responsive UI. Components are modular for easy maintenance and extension.
- **Backend:** Node.js/Express with OpenAI integration for semantic search and answer generation. Multer is used for file uploads. All logic is in a single file (`server.js`) for simplicity.
- **Document Handling:** Documents are stored as `.txt` files. The system supports both main and supporting documents (with relationship tracking possible via database extension).
- **Confidence & Enrichment:** Answers are scored for completeness and confidence using strict rules (length, citation, keyword coverage, redundancy, uncertainty). Enrichment suggestions guide users to improve their knowledge base.
- **Highlighting:** Source citations in answers are visually highlighted for traceability.
- **No Database (Prototype):** Document metadata is stored in-memory for speed. SQLite integration is recommended for production.

## Trade-offs Due to 24h Constraint
- **No Database:** For speed, document relationships and metadata are stored in-memory. This limits persistence and scalability but enables rapid iteration.
- **Minimal Testing:** Automated tests and advanced error handling are omitted to focus on core features.
- **Single-File Backend:** All backend logic is in `server.js` for simplicity, at the cost of modularity.
- **Basic NLP:** Keyword extraction and enrichment logic use simple regex and filtering, not advanced NLP libraries.
- **Limited File Types:** Only `.txt` files are supported for upload and search.
- **Frontend Polish:** UI is functional and clean, but some advanced features (drag-and-drop, multi-user, real-time updates) are not included.

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

## Contact
For questions or contributions, contact [Avaneeshakrishna](mailto:avaneesh.shastry@gmail.com).
