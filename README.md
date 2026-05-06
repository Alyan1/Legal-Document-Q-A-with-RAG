# Legal Document Q&A (RAG System)

A modern, full-stack Retrieval-Augmented Generation (RAG) system for questioning legal documents and PDFs.

<img width="1376" height="768" alt="rag cover image 5" src="https://github.com/user-attachments/assets/2dfaa757-56cf-42ca-8fe4-d2ff7e3aec7b" />

## Features

- **Zero-Cost Local Embeddings**: Uses `sentence-transformers` locally to embed documents without API costs.
- **Multilingual Support**: Handles documents and questions in 50+ languages natively.
- **Context Filtering**: Select specific PDFs to query against, ensuring highly relevant answers and preventing cross-document hallucination.
- **Source Attribution**: Transparently displays the exact document chunks used by the AI to generate answers.
- **Modern UI**: Sleek, dark-mode React frontend with drag-and-drop file uploads.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Python, FastAPI
- **Vector Database**: ChromaDB
- **LLM Engine**: Google Gemini 2.5 Flash (`google-genai` SDK)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
Navigate to the root directory and create a virtual environment (optional but recommended):
```bash
# Install dependencies (assuming you have a requirements.txt or manually install them)
pip install fastapi uvicorn chromadb sentence-transformers google-genai python-dotenv pydantic pdfplumber python-multipart

# Create a .env file and add your Gemini API key:
# GEMINI_API_KEY=your_api_key_here

# Start the server
uvicorn backend.main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup
Open a new terminal and navigate to the `client` directory:
```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Architecture Flow

<img width="1376" height="768" alt="rag cover image 4" src="https://github.com/user-attachments/assets/3a8ff3d3-d606-4a69-b756-3d2f1d6dd04a" />
1. **Ingestion**: PDFs are uploaded via the React UI to FastAPI.
2. **Processing**: `pdfplumber` extracts text, which is chunked into paragraphs.
3. **Embedding**: A local `SentenceTransformer` converts chunks to vectors and stores them in ChromaDB.
4. **Retrieval**: User queries are embedded, and ChromaDB performs a similarity search (filtered by document if requested).
5. **Generation**: The retrieved context and user query are sent to Gemini to generate a precise answer.
