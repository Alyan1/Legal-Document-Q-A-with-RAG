from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.database import add_documents_to_db, collection, delete_document_from_db
from pydantic import BaseModel
from typing import Optional

# Import our custom modules
from backend.pdf_extraction import extract_and_chunk_pdf
from backend.database import add_documents_to_db, collection
from backend.qa_engine import ask_question

app = FastAPI(title="Zero-Cost Multilingual RAG API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Update the Pydantic model to accept an optional filename
class QueryRequest(BaseModel):
    question: str
    filename: Optional[str] = "All Documents"


@app.get("/")
def health_check():
    return {"status": "RAG Backend is running perfectly!"}


@app.get("/documents")
def get_available_documents():
    """
    Endpoint to retrieve a list of all unique PDFs currently stored in the database.
    """
    try:
        # Get all metadata from ChromaDB
        result = collection.get(include=["metadatas"])
        metadatas = result.get("metadatas", [])

        # Extract unique filenames using a set
        unique_files = set()
        for meta in metadatas:
            if meta and "source" in meta:
                unique_files.add(meta["source"])

        # Return a sorted list of filenames
        return {"documents": sorted(list(unique_files))}
    except Exception as e:
        print(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents.")


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF, chunk it, and save to ChromaDB.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        file_bytes = await file.read()
        print(f"Processing upload: {file.filename}")
        chunks = extract_and_chunk_pdf(file_bytes)

        if not chunks:
            raise HTTPException(status_code=400, detail="No readable text found in the PDF.")

        num_chunks = add_documents_to_db(chunks, file.filename)

        return {
            "message": f"Successfully processed '{file.filename}'.",
            "chunks_embedded": num_chunks
        }
    except Exception as e:
        print(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.delete("/documents/{filename}")
def delete_document(filename: str):
    """
    Endpoint to delete a specific PDF from the database.
    """
    success = delete_document_from_db(filename)
    if success:
        return {"message": f"Successfully deleted '{filename}'."}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete document.")


@app.post("/ask")
async def ask(request: QueryRequest):
    """
    Endpoint to ask a question, optionally filtering by filename.
    """
    try:
        # Pass both the question and the filename filter to the engine
        response = ask_question(request.question, filename=request.filename)
        return response
    except Exception as e:
        print(f"Error generating answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")